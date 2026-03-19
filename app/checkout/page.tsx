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
      alert("Fill all fields ❌");
      return;
    }

    if (cart.length === 0) {
      alert("Cart empty ❌");
      return;
    }

    const { error } = await supabase.from("orders").insert([
      {
        name,
        phone,
        address,
        total: getCartTotal(),
        items: cart, // 🔥 IMPORTANT
      },
    ]);

    if (error) {
      alert("Order failed");
      return;
    }

    localStorage.removeItem("cart");
    router.push("/success");
  }

  return (
    <main className="p-10 bg-black text-white min-h-screen">
      <h1 className="text-3xl mb-6 text-green-500">Checkout</h1>

      <input className="w-full p-3 mb-3 bg-gray-800" placeholder="Name" onChange={e=>setName(e.target.value)} />
      <input className="w-full p-3 mb-3 bg-gray-800" placeholder="Phone" onChange={e=>setPhone(e.target.value)} />
      <textarea className="w-full p-3 mb-3 bg-gray-800" placeholder="Address" onChange={e=>setAddress(e.target.value)} />

      <h2>Total: ¥{getCartTotal()}</h2>

      <button onClick={placeOrder} className="mt-6 bg-green-600 w-full py-3">
        Place Order
      </button>
    </main>
  );
}