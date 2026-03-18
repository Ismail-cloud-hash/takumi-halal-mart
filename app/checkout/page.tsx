"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { getCart, getCartTotal } from "../../lib/cart";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {

  const router = useRouter();

  const [cart, setCart] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    setCart(getCart());
  }, []);

  async function placeOrder() {

    if (!name || !phone || !address) {
      alert("Fill all fields");
      return;
    }

    const total = getCartTotal();

    const { error } = await supabase.from("orders").insert([
      {
        name,
        phone,
        address,
        total,
      },
    ]);

    if (error) {
      alert("Order failed ❌");
      return;
    }

    localStorage.removeItem("cart");

    alert("Order placed successfully ✅");

    router.push("/");
  }

  return (
    <main className="p-10 max-w-xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Checkout 💳
      </h1>

      {/* FORM */}
      <div className="space-y-4">

        <input
          placeholder="Your Name"
          className="w-full p-3 bg-gray-800 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Phone Number"
          className="w-full p-3 bg-gray-800 rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <textarea
          placeholder="Address"
          className="w-full p-3 bg-gray-800 rounded"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

      </div>

      {/* CART SUMMARY */}
      <div className="mt-6 bg-gray-900 p-4 rounded">

        <h2 className="text-xl mb-3">Order Summary</h2>

        {cart.map((item) => (
          <div key={item.id} className="flex justify-between mb-2">
            <p>{item.name} x {item.quantity}</p>
            <p>¥{item.price * item.quantity}</p>
          </div>
        ))}

        <h3 className="mt-4 font-bold">
          Total: ¥{getCartTotal()}
        </h3>

      </div>

      <button
        onClick={placeOrder}
        className="mt-6 w-full bg-green-600 py-3 rounded"
      >
        Place Order
      </button>

    </main>
  );
}