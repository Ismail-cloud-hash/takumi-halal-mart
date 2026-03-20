"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Link from "next/link";
import { addToCart, getCartCount } from "../lib/cart";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetchProducts();
    updateCart();

    window.addEventListener("cartUpdated", updateCart);
    return () => window.removeEventListener("cartUpdated", updateCart);
  }, []);

  function updateCart() {
    setCartCount(getCartCount());
  }

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*");
    setProducts(data || []);
  }

  const categories = ["all","Fruits","Halal Meat","Rice","Snacks","Drinks","Frozen Foods"];

  return (
    <main className="bg-gradient-to-br from-black via-gray-900 to-black text-white min-h-screen p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-green-400 text-2xl font-bold">Takumi Halal Mart</h1>

        <Link href="/cart" className="relative">
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 px-2 text-xs rounded-full">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* HERO */}
      <div className="p-6 mb-6 rounded-xl bg-white/5 backdrop-blur border border-white/10">
        <h2 className="text-3xl font-bold">Ramadan Sale 🌙</h2>
      </div>

      {/* CATEGORY */}
      <div className="flex gap-3 mb-4 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={()=>setCategory(cat)}
            className={`px-4 py-2 rounded-full ${
              category === cat ? "bg-green-600" : "bg-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search..."
        className="w-full p-3 mb-6 bg-gray-800 rounded"
        onChange={(e)=>setSearch(e.target.value)}
      />

      {/* PRODUCTS */}
      <div className="grid md:grid-cols-3 gap-6">
        {products
          .filter(p =>
            (category==="all"||p.category===category) &&
            p.name?.toLowerCase().includes(search.toLowerCase())
          )
          .map(product => (

            <div key={product.id} className="bg-white/5 rounded-xl p-4 border border-white/10">

              <Link href={`/product/${product.id}`}>
                <img src={product.image || "/placeholder.png"} className="w-full h-40 object-cover rounded"/>
              </Link>

              <h2 className="mt-2">{product.name}</h2>
              <p className="text-green-400">¥{product.price}</p>

              <button
                onClick={()=>addToCart(product)}
                className="mt-2 w-full bg-green-600 py-2 rounded"
              >
                Add to Cart
              </button>

            </div>

          ))}
      </div>

    </main>
  );
}