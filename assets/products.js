/*
  Product catalog — edit this file to change what's in the store.
  - images: list real photo paths (e.g. "/images/hoodie-1.jpg"). Leave empty to show gray placeholders;
    `placeholderCount` controls how many placeholder slides show until real photos exist.
  - compareAt: original price, set it to show a SALE badge with the old price crossed out.
  - soldOut: sizes that are out of stock.
  - collections: which menu categories the product shows up in.
*/
window.SW_PRODUCTS = [
  { id: "product-01", name: "Product One Hoodie", price: 120, sizes: ["XS", "S", "M", "L", "XL"], soldOut: [], collections: ["tops", "new-items", "best-sellers"], images: [], placeholderCount: 6, description: "Placeholder description. Heavyweight zip hoodie with embroidered graphic." },
  { id: "product-02", name: "Product Two Denim", price: 126, sizes: ["XXS", "S", "M", "L", "XL"], soldOut: [], collections: ["bottoms", "new-items"], images: [], placeholderCount: 3, description: "Placeholder description. Flared denim with stitched panel detail." },
  { id: "product-03", name: "Product Three Thermal White", price: 80, sizes: ["XS", "S", "M", "L", "XL"], soldOut: [], collections: ["tops", "new-items"], images: [], placeholderCount: 4, description: "Placeholder description. Waffle-knit thermal with printed graphic." },
  { id: "product-04", name: "Product Three Thermal Black", price: 80, sizes: ["XS", "S", "M", "L", "XL"], soldOut: ["XS"], collections: ["tops", "new-items", "best-sellers"], images: [], placeholderCount: 5, description: "Placeholder description. Waffle-knit thermal with printed graphic." },
  { id: "product-05", name: "Product Five Longsleeve", price: 80, sizes: ["XS", "S", "M", "L", "XL"], soldOut: [], collections: ["tops", "new-items"], images: [], placeholderCount: 6, description: "Placeholder description. Layered longsleeve with sleeve print." },
  { id: "product-06", name: "Product Six Denim", price: 108, sizes: ["XS", "S", "M", "L", "XL", "XXL"], soldOut: [], collections: ["bottoms", "new-items", "best-sellers"], images: [], placeholderCount: 5, description: "Placeholder description. Wide-leg washed denim." },
  { id: "product-07", name: "Product Seven Hoodie", price: 120, sizes: ["XS", "S", "M", "L", "XL"], soldOut: [], collections: ["tops", "new-items"], images: [], placeholderCount: 6, description: "Placeholder description. Faux-fur hood utility jacket." },
  { id: "product-08", name: "Product Eight Sweats", price: 105, sizes: ["XS", "S", "M", "L", "XL"], soldOut: [], collections: ["bottoms", "new-items", "best-sellers"], images: [], placeholderCount: 4, description: "Placeholder description. Wide-leg sweatpants with script print." },
  { id: "product-09", name: "Product Nine Hoodie", price: 108, compareAt: 135, sizes: ["XS", "S", "M", "L", "XL"], soldOut: [], collections: ["tops"], images: [], placeholderCount: 6, description: "Placeholder description. Zip hoodie with hood script embroidery." },
  { id: "product-10", name: "Product Ten Sweats", price: 95, sizes: ["XS", "S", "M", "L", "XL"], soldOut: ["XS", "S", "M", "L", "XL"], collections: ["bottoms"], images: [], placeholderCount: 6, description: "Placeholder description. Relaxed fit sweatpants." }
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
