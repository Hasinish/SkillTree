import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { CoinsIcon, ShoppingCartIcon } from "lucide-react";

export default function ShopPage() {
  const [items, setItems] = useState([]);
  const [coins, setCoins] = useState(null);
  const [buying, setBuying] = useState(null);

  const load = async () => {
    try {
      const [shop, me] = await Promise.all([
        api.get("/shop/items"),
        api.get("/users/me"),
      ]);
      setItems(shop.data || []);
      setCoins(typeof me?.data?.coins === "number" ? me.data.coins : 0);
    } catch {
      toast.error("Could not load shop");
    }
  };

  useEffect(() => { load(); }, []);

  const buy = async (itemId) => {
    setBuying(itemId);
    try {
      const { data } = await api.post(`/shop/buy/${itemId}`);
      setCoins(data.coins);
      window.dispatchEvent(new CustomEvent("coins:update", { detail: { coins: data.coins } }));
      toast.success(`Purchased ${data?.purchased?.name || "item"}!`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Purchase failed");
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="btn btn-ghost">← Back</Link>
          <h1 className="text-2xl font-bold">Forest Shop</h1>
          <div className="badge bg-amber-200 text-amber-900 px-3 py-2 flex items-center gap-1">
            <CoinsIcon className="h-4 w-4" />
            <span>{coins ?? "—"} coins</span>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            {items.length === 0 ? (
              <p className="opacity-70">No items available.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((it) => {
                  const afford = typeof coins === "number" ? coins >= it.price : true;
                  const src = it.icon || `/shop/${it.id}.png`;
                  return (
                    <div key={it.id} className="p-4 border border-primary bg-base-100 shadow flex flex-col">
                      {/* Item icon */}
                      <div className="w-full h-32 bg-base-200 flex items-center justify-center mb-3">
                        <img
                          src={src}
                          alt={it.name}
                          className="w-20 h-20 object-contain"
                          style={{ imageRendering: "pixelated" }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold">{it.name}</h3>
                        <p className="text-sm opacity-70 mt-1">{it.desc}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="badge bg-amber-200 text-amber-900">
                          {it.price} coins
                        </span>
                        <button
                          className={`btn btn-primary btn-sm ${!afford ? "btn-disabled" : ""}`}
                          disabled={!afford || buying === it.id}
                          onClick={() => buy(it.id)}
                        >
                          {buying === it.id ? (
                            <span className="loading loading-xs" />
                          ) : (
                            <>
                              <ShoppingCartIcon className="h-4 w-4 mr-1" />
                              Buy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs opacity-60 mt-4">
              Icons are pixel-art PNGs (64×64, transparent). Missing image? Check <code>/public/shop/</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
