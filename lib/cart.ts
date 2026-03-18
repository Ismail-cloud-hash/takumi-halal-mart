export function getCart() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("cart") || "[]");
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

  localStorage.setItem("cart", JSON.stringify(cart));
}

export function removeFromCart(id: number) {
  const cart = getCart().filter((item: any) => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function getCartTotal() {
  const cart = getCart();
  return cart.reduce(
    (total: number, item: any) => total + item.price * item.quantity,
    0
  );
}