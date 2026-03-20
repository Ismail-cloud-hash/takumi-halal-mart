export function getCart() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart: any[]) {
  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
}

export function addToCart(product: any) {
  const cart = getCart();

  const existing = cart.find((i: any) => i.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
}

export function removeFromCart(id: number) {
  saveCart(getCart().filter((i: any) => i.id !== id));
}

export function getCartTotal() {
  return getCart().reduce(
    (t: number, i: any) => t + i.price * i.quantity,
    0
  );
}

export function getCartCount() {
  return getCart().reduce((t: number, i: any) => t + i.quantity, 0);
}