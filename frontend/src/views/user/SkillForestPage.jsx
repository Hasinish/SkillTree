import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { SaveIcon, XIcon, PackageIcon, MousePointerClickIcon } from "lucide-react";

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function toPct(px, total) { return total ? clamp((px / total) * 100, 0, 100) : 0; }
function uuid() { return (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)); }

export default function SkillForestPage() {
  const [learning, setLearning] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inventory, setInventory] = useState([]);
  const [catalog, setCatalog] = useState([]);

  // saved decorations per skill (shown on forest)
  const [decosMap, setDecosMap] = useState({}); // { skillId: Decoration[] }

  // overlay editor state
  const [overlayFor, setOverlayFor] = useState(null); // entry from learning
  const [workDecos, setWorkDecos] = useState([]);     // working layout
  const [overlayInv, setOverlayInv] = useState([]);   // working inventory (qty changes immediately)
  const [armedItem, setArmedItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef(null);
  const draggingRef = useRef(null); // { id, dx, dy }
  const movedRef = useRef(false);
  const suppressNextClickRef = useRef(false);

  // sizing
  const TREE_BOX = "w-40 h-40";                 // tree sprite box
  const OVERLAY_ITEM_SIZE = "w-24 h-24";        // 2× bigger (overlay)
  const FOREST_ITEM_SIZE  = "w-8 h-8";        // 2× bigger (on forest)

  useEffect(() => {
    const load = async () => {
      try {
        const [learn, me, shop] = await Promise.all([
          api.get("/learning"),
          api.get("/users/me"),
          api.get("/shop/items"),
        ]);
        setLearning(learn.data || []);
        setInventory(me.data?.inventory || []);
        setCatalog(shop.data || []);
      } catch {
        toast.error("Could not load your forest");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // prefetch saved decorations for 100% trees
  useEffect(() => {
    const run = async () => {
      const reqs = learning.map(async (e) => {
        const total = e.tasks.length;
        const done  = e.completedTasks.filter(Boolean).length;
        const pct   = total ? Math.round((done / total) * 100) : 0;
        if (pct !== 100) return null;
        try {
          const { data } = await api.get(`/learning/${e._id}/decorations`);
          return { id: e._id, decorations: data?.decorations || [] };
        } catch { return null; }
      });
      const results = await Promise.all(reqs);
      const map = {};
      for (const r of results) if (r) map[r.id] = r.decorations;
      setDecosMap(map);
    };
    if (learning.length) run();
  }, [learning]);

  const iconById = useMemo(() => {
    const m = new Map();
    for (const it of catalog) m.set(it.id, it.icon || `/shop/${it.id}.png`);
    return m;
  }, [catalog]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const stageSrc = (p) => {
    if (p === 0) return "/trees/seed.png";
    if (p < 25) return "/trees/sprout.png";
    if (p < 50) return "/trees/small-plant.png";
    if (p < 75) return "/trees/young-tree.png";
    if (p < 100) return "/trees/leafy-tree.png";
    return "/trees/full-tree.png";
  };
  const progressOf = (e) => {
    const t = e.tasks.length;
    const d = e.completedTasks.filter(Boolean).length;
    return t ? Math.round((d / t) * 100) : 0;
  };

  // ---------- Overlay open/close ----------
  async function openOverlay(entry) {
    const pct = progressOf(entry);
    if (pct < 100) {
      toast.error("Only fully-grown (100%) trees can be decorated.");
      return;
    }
    try {
      const [{ data: decos }, { data: me }] = await Promise.all([
        api.get(`/learning/${entry._id}/decorations`),
        api.get("/users/me"),
      ]);
      setOverlayFor(entry);
      setWorkDecos(decos?.decorations || []);
      // start with a local, mutable copy of inventory for immediate qty changes
      setOverlayInv((me?.inventory || []).map((x) => ({ ...x })));
      setArmedItem(null);
    } catch {
      toast.error("Could not load decorator");
    }
  }
  function closeOverlay() {
    setOverlayFor(null);
    setWorkDecos([]);
    setOverlayInv([]);
    setArmedItem(null);
  }

  function onTreeContext(ev, entry) {
    ev.preventDefault();
    openOverlay(entry);
  }

  // ---------- Inventory helpers (overlay) ----------
  function invQty(itemId) {
    return overlayInv.find(i => i.itemId === itemId)?.qty ?? 0;
  }
  function addQty(itemId, n) {
    setOverlayInv(prev => {
      const copy = prev.map(i => ({ ...i }));
      const found = copy.find(i => i.itemId === itemId);
      if (found) found.qty = Math.max(0, found.qty + n);
      else copy.push({ itemId, qty: Math.max(0, n), acquiredAt: new Date() });
      return copy;
    });
  }

  // ---------- Place item by clicking canvas ----------
  function onCanvasClick(e) {
    if (suppressNextClickRef.current) { // swallow post-drag click
      suppressNextClickRef.current = false;
      return;
    }
    if (!armedItem) return;

    const leftBtn = e.button === 0 || e.button === undefined;
    if (!leftBtn) return;

    const box = canvasRef.current?.getBoundingClientRect();
    if (!box) return;

    const leftQty = invQty(armedItem);
    if (leftQty <= 0) {
      toast.error("Out of stock for this item");
      setArmedItem(null);
      return;
    }

    const xPct = toPct(e.clientX - box.left, box.width);
    const yPct = toPct(e.clientY - box.top,  box.height);

    setWorkDecos(prev => [...prev, { id: uuid(), itemId: armedItem, xPct, yPct }]);
    addQty(armedItem, -1); // decrement immediately

    // keep armed so user can place multiples; auto-disarm if runs out
    if (invQty(armedItem) - 1 <= 0) setArmedItem(null);
  }

  // ---------- Drag to move (no duplicate creation) ----------
  function onDecoMouseDown(e, deco) {
    e.stopPropagation(); // don't bubble to canvas -> prevents click add
    if (e.button === 2 || e.altKey) { // right-click or Alt = remove
      e.preventDefault();
      removeDeco(deco.id);
      return;
    }
    const box = canvasRef.current?.getBoundingClientRect();
    if (!box) return;
    const xPct = toPct(e.clientX - box.left, box.width);
    const yPct = toPct(e.clientY - box.top,  box.height);
    draggingRef.current = { id: deco.id, dx: deco.xPct - xPct, dy: deco.yPct - yPct };
    movedRef.current = false;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    e.preventDefault();
  }
  function onMouseMove(e) {
    const drag = draggingRef.current; if (!drag) return;
    movedRef.current = true;
    const box = canvasRef.current?.getBoundingClientRect(); if (!box) return;
    const xPct = toPct(e.clientX - box.left, box.width) + drag.dx;
    const yPct = toPct(e.clientY - box.top,  box.height) + drag.dy;
    setWorkDecos(prev => prev.map(d => d.id === drag.id ? ({ ...d, xPct: clamp(xPct,0,100), yPct: clamp(yPct,0,100) }) : d));
  }
  function onMouseUp() {
    if (draggingRef.current && movedRef.current) {
      // prevent the synthetic click after drag from placing a new item
      suppressNextClickRef.current = true;
    }
    draggingRef.current = null;
    movedRef.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  // ---------- Remove placed decoration (returns qty immediately) ----------
  function removeDeco(id) {
    setWorkDecos(prev => {
      const found = prev.find(d => d.id === id);
      if (found) addQty(found.itemId, +1);
      return prev.filter(d => d.id !== id);
    });
  }

  // ---------- Save ----------
  async function saveLayout() {
    if (!overlayFor) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/learning/${overlayFor._id}/decorations`, { decorations: workDecos });
      // update top-nav coins qty via /users/me is already handled in your navbar; here we sync inventory & saved layout
      setInventory(data?.inventory || inventory);
      setDecosMap(m => ({ ...m, [overlayFor._id]: data?.decorations || [] }));
      toast.success("Layout saved!");
      closeOverlay();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not save layout");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral p-6" onMouseUp={onMouseUp}>
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="btn btn-ghost text-lg">← Back</Link>
          <h1 className="text-2xl font-bold">My Skill Forest</h1>
          <div />
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div
              className="rounded-xl border border-primary bg-secondary-content/40 p-3 bg-bottom bg-cover"
              style={{ backgroundImage: "url('/forest/forest-bg.png')", imageRendering: "pixelated" }}
            >
              <div className="min-h-[600px] overflow-x-auto">
                <div className="grid grid-flow-col auto-cols-max items-end gap-0 h-[460px] px-4 ml-6">
                  {learning.length === 0 ? (
                    <p className="opacity-70 col-span-full py-24">No trees yet. Start learning from the Skills page.</p>
                  ) : (
                    learning.map((e) => {
                      const pct = progressOf(e);
                      const canDecorate = pct === 100;
                      const list = decosMap[e._id] || [];
                      return (
                        <div
                          key={e._id}
                          className={`tooltip tooltip-top -ml-6 ${canDecorate ? "cursor-context-menu" : ""}`}
                          data-tip={`${e.name} — ${pct}%`}
                          onContextMenu={(ev) => onTreeContext(ev, e)}
                        >
                          <div className={`relative ${TREE_BOX} mb-[-2px]`}>
                            <img
                              src={stageSrc(pct)}
                              alt={e.name}
                              className={`absolute inset-0 ${TREE_BOX} object-contain transition-transform hover:scale-110`}
                              style={{ imageRendering: "pixelated" }}
                            />
                            {canDecorate && list.map(d => {
                              const src = iconById.get(d.itemId) || `/shop/${d.itemId}.png`;
                              return (
                                <img
                                  key={d.id}
                                  src={src}
                                  alt={d.itemId}
                                  className={`absolute ${FOREST_ITEM_SIZE} -translate-x-1/2 -translate-y-1/2 pointer-events-none`}
                                  style={{ left: `${d.xPct}%`, top: `${d.yPct}%`, imageRendering: "pixelated" }}
                                  onError={(ev) => { ev.currentTarget.style.display = 'none'; }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 text-sm opacity-80 flex items-center gap-2">
              <MousePointerClickIcon className="h-4 w-4" />
              Right-click a 100% tree to open the decorator. Click an item to place (consumes 1), drag to move, Alt/right-click to remove.
            </div>
          </div>
        </div>
      </div>

      {/* ===== Overlay editor ===== */}
      {overlayFor && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onContextMenu={(e) => e.preventDefault()}>
          <div className="bg-base-100 w-full max-w-5xl rounded-lg shadow-xl border border-primary overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageIcon className="h-5 w-5 text-primary" />
                <div className="font-semibold">Decorate: {overlayFor.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-ghost btn-sm" onClick={closeOverlay}>
                  <XIcon className="h-4 w-4 mr-1" /> Cancel
                </button>
                <button className={`btn btn-primary btn-sm ${saving ? "btn-disabled" : ""}`} onClick={saveLayout} disabled={saving}>
                  {saving ? <span className="loading loading-xs" /> : <><SaveIcon className="h-4 w-4 mr-1" /> Save Layout</>}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Canvas */}
              <div className="md:col-span-3 p-4">
                <div
                  ref={canvasRef}
                  className="relative w-full aspect-square bg-base-200 border border-primary flex items-center justify-center"
                  onClick={onCanvasClick}
                >
                  <img
                    src={"/trees/full-tree.png"}
                    alt="Tree"
                    className="max-h-full max-w-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                  {workDecos.map(d => {
                    const src = iconById.get(d.itemId) || `/shop/${d.itemId}.png`;
                    return (
                      <img
                        key={d.id}
                        src={src}
                        alt={d.itemId}
                        className={`absolute ${OVERLAY_ITEM_SIZE} -translate-x-1/2 -translate-y-1/2 cursor-move select-none`}
                        style={{ left: `${d.xPct}%`, top: `${d.yPct}%`, imageRendering: "pixelated" }}
                        draggable={false}
                        onMouseDown={(e) => onDecoMouseDown(e, d)}
                        onError={(ev) => { ev.currentTarget.style.display = 'none'; }}
                        title="Drag to move · Alt/right-click to remove"
                      />
                    );
                  })}
                </div>
                <div className="mt-2 text-xs opacity-70">
                  Tip: Click the canvas to drop an armed item. Drag items to reposition.
                </div>
              </div>

              {/* Inventory */}
              <div className="md:col-span-2 p-4 border-t md:border-t-0 md:border-l">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <PackageIcon className="h-4 w-4 text-primary" /> Inventory
                </h3>

                {(!overlayInv || overlayInv.length === 0) ? (
                  <p className="opacity-70">No items yet. Buy some in the <Link to="/shop" className="link link-primary">Shop</Link>.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {overlayInv.map((it, idx) => {
                      const src = iconById.get(it.itemId) || `/shop/${it.itemId}.png`;
                      const qtyLeft = invQty(it.itemId);
                      const isArmed = armedItem === it.itemId;
                      return (
                        <button
                          key={`${it.itemId}-${idx}`}
                          className={`p-2 border bg-base-100 text-left ${qtyLeft ? "hover:bg-base-200" : "opacity-50"} ${isArmed ? "outline outline-2 outline-primary" : ""}`}
                          disabled={!qtyLeft}
                          onClick={() => setArmedItem(isArmed ? null : it.itemId)}
                          title={qtyLeft ? "Click to arm for placement" : "Out of stock"}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14 bg-base-200 flex items-center justify-center">
                              <img
                                src={src}
                                alt={it.itemId}
                                className="w-14 h-14 object-contain"
                                style={{ imageRendering: "pixelated" }}
                                onError={(ev) => { ev.currentTarget.style.display = 'none'; }}
                              />
                              <span className="absolute -right-1 -bottom-1 badge badge-primary badge-sm">x{qtyLeft}</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{it.itemId}</div>
                              <div className="text-xs opacity-70">{isArmed ? "Armed" : "Click to arm"}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {armedItem && (
                  <div className="mt-3 text-xs opacity-70">
                    Armed: <span className="font-semibold">{armedItem}</span> — click the tree canvas to place (uses 1).
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
