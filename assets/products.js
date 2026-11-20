/*
  Product catalog — edit this file to change what's in the store.
  - images: list real photo paths (e.g. "/images/hoodie-1.jpg"). Leave empty to show gray placeholders;
    `placeholderCount` controls how many placeholder slides show until real photos exist.
  - compareAt: original price, set it to show a SALE badge with the old price crossed out.
  - soldOut: sizes that are out of stock.
  - collections: which menu categories the product shows up in.
*/
window.SW_PRODUCTS = [
  { id: "sw-flannel", name: "SW Plaid Flannel", price: 120, sizes: ["S", "M", "L", "XL", "XXL"], soldOut: [], collections: ["tops", "new-items", "best-sellers"], images: [], placeholderCount: 4,
    description: "Plaid flannel button-up with embroidered SW chest logo and paint-splatter detail." },
  { id: "charcoal-baggy-sweatpants", name: "Charcoal Baggy Sweatpants", price: 80, sizes: ["S", "M", "L", "XL", "XXL"], soldOut: [], collections: ["bottoms", "new-items", "best-sellers"], images: [], placeholderCount: 4,
    description: "Charcoal grey sweatpants with a light wash and a baggy fit. Features hidden zippers, patchwork stitching and an elastic waistband." },
  { id: "charcoal-three-quarter-shorts", name: "Charcoal 3/4 Shorts", price: 80, sizes: ["S", "M", "L", "XL", "XXL"], soldOut: [], collections: ["bottoms", "new-items", "best-sellers"], images: [], placeholderCount: 4,
    description: "Charcoal grey 3/4-length shorts. Features hidden zippers, patchwork stitching and an elastic waistband." }
];

window.SW_COLLECTIONS = [
  { id: "shop-all", name: "Shop All" },
  { id: "tops", name: "Tops" },
  { id: "bottoms", name: "Bottoms" },
  { id: "best-sellers", name: "Best Sellers" },
  { id: "new-items", name: "New Items" }
];

/* Store-wide settings */
window.SW_SETTINGS = {
  brand: "Stay Weird Studios",
  freeShipping: 150,
  bundleDiscount: 0.15, // "Frequently bought together" discount
  announcements: ["Free shipping on orders over $150", "Returns & exchanges", "New drop out now"],
  instagram: "https://instagram.com/"
};
