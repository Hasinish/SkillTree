// backend/src/config/shop.js
// Icon files are served by the frontend at /shop/<id>.png (public folder).
// Make sure you place your PNGs in: frontend/public/shop/

export const SHOP_ITEMS = [
  { id: "leaf-banner",   name: "Leaf Banner",   price: 8,  icon: "/shop/leaf-banner.png",   desc: "A leafy banner to hang on trees." },
  { id: "bird-house",    name: "Bird House",    price: 15, icon: "/shop/bird-house.png",    desc: "A cozy home for your pixel-birds." },
  { id: "fairy-lights",  name: "Fairy Lights",  price: 20, icon: "/shop/fairy-lights.png",  desc: "String lights that twinkle at dusk." },
  { id: "tree-ribbon",   name: "Tree Ribbon",   price: 10, icon: "/shop/tree-ribbon.png",   desc: "Tie a pretty ribbon around a trunk." },
  { id: "ground-rocks",  name: "Ground Rocks",  price: 6,  icon: "/shop/ground-rocks.png",  desc: "Decorative stones for the base." },
  { id: "mushroom-pack", name: "Mushroom Pack", price: 12, icon: "/shop/mushroom-pack.png", desc: "Cute mushrooms to place nearby." },
  { id: "wind-chime",    name: "Wind Chime",    price: 18, icon: "/shop/wind-chime.png",    desc: "Soft chimes in the pixel breeze." },
  { id: "tree-plaque",   name: "Tree Plaque",   price: 9,  icon: "/shop/tree-plaque.png",   desc: "Nameplate to label a tree." },
];
