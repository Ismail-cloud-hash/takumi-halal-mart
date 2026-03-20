"use client";

import { useEffect, useState } from "react";
import { getCart, removeFromCart, getCartTotal } from "../../lib/cart";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();

  useEffect(()=>{ setCart(getCart()); },[]);

  function remove(id:number){
    removeFromCart(id);
    setCart(getCart());
  }

  return (
    <main className="p-10 bg-black text-white min-h-screen max-w-xl mx-auto">

      <h1 className="text-2xl mb-6">Cart</h1>

      {cart.map(item=>(
        <div key={item.id} className="flex justify-between mb-3">
          <p>{item.name} x {item.quantity}</p>
          <button onClick={()=>remove(item.id)}>❌</button>
        </div>
      ))}

      <h2>Total: ¥{getCartTotal()}</h2>

      <button onClick={()=>router.push("/checkout")} className="mt-4 bg-green-600 w-full py-3">
        Checkout
      </button>

    </main>
  );
}