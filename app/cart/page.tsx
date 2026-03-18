"use client";

import { useEffect, useState } from "react";
import { getCart, removeFromCart, getCartTotal } from "../../lib/cart";
import Link from "next/link";

export default function CartPage() {

  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  function handleRemove(id: number) {
    removeFromCart(id);
    setCart(getCart());
  }

  return (
    <main className="p-10">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Your Cart 🛒
        </h1>

        <Link href="/" className="bg-gray-700 px-4 py-2 rounded">
          Back
        </Link>
      </div>

      {cart.length === 0 && <p>No items in cart</p>}

      {cart.map((item) => (
        <div
          key={item.id}
          className="flex justify-between bg-gray-900 p-4 mb-3 rounded"
        >
          <div>
            <p className="font-bold">{item.name}</p>
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

      <button className="mt-6 bg-green-600 w-full py-3 rounded">
        Proceed to Checkout
      </button>

    </main>
  );
}