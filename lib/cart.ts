export function getCart() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart: any[]) {
  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated")); // 🔥 global update
}

export function addToCart(product: any) {
  const cart = getCart();

  const existing = cart.find((item: any) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  saveCart(cart);
}

export function removeFromCart(id: number) {
  const cart = getCart().filter((item: any) => item.id !== id);
  saveCart(cart);
}

export function getCartTotal() {
  return getCart().reduce(
    (total: number, item: any) => total + item.price * item.quantity,
    0
  );
}

export function getCartCount() {
  return getCart().reduce(
    (total: number, item: any) => total + item.quantity,
    0
  );
}