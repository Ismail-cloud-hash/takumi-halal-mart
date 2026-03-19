"use client";

import { useEffect, useState } from "react";
import { getCart, removeFromCart, getCartTotal } from "../../lib/cart";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    setCart(getCart());
  }, []);

  function handleRemove(id: number) {
    removeFromCart(id);
    setCart(getCart());
  }

  function handleCheckout() {
    if (cart.length === 0) {
      alert("Cart is empty ❌");
      return;
    }
    router.push("/checkout");
  }

  return (
    <main className="p-10 bg-black text-white min-h-screen">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Cart 🛒</h1>
        <Link href="/" className="bg-gray-700 px-4 py-2 rounded">Back</Link>
      </div>

      {cart.length === 0 && <p>No items</p>}

      {cart.map(item => (
        <div key={item.id} className="flex justify-between bg-gray-900 p-4 mb-3 rounded">
          <div>
            <p>{item.name}</p>
            <p>¥{item.price} x {item.quantity}</p>
          </div>

          <button
            onClick={() => handleRemove(item.id)}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Remove
          </button>
        </div>
      ))}

      <h2 className="mt-6 text-xl font-bold">
        Total: ¥{getCartTotal()}
      </h2>

      <button
        onClick={handleCheckout}
        className="mt-6 bg-green-600 w-full py-3 rounded"
      >
        Checkout
      </button>
    </main>
  );
}