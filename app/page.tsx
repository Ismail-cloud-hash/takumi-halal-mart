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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    setProducts(data || []);
  }

  const categories = [
    "all",
    "Fruits",
    "Halal Meat",
    "Rice",
    "Snacks",
    "Drinks",
    "Frozen Foods",
  ];

  return (
    <main className="bg-gradient-to-br from-black via-gray-900 to-black text-white min-h-screen">

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center p-4 backdrop-blur-md bg-white/5 border-b border-white/10">

        <button onClick={() => setSidebarOpen(true)} className="text-2xl">
          ☰
        </button>

        <h1 className="text-xl font-bold text-green-400">
          Takumi Halal Mart
        </h1>

        <Link href="/cart" className="relative">
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-xs px-2 rounded-full">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* 🔥 SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed top-0 left-0 w-80 h-full bg-white text-black z-50 p-4 overflow-y-auto">

          <div className="flex justify-between mb-4">
            <h2 className="font-bold text-green-600">Categories</h2>
            <button onClick={() => setSidebarOpen(false)}>✖</button>
          </div>

          {categories.map(cat => (
            <p
              key={cat}
              onClick={() => {
                setCategory(cat);
                setSidebarOpen(false);
              }}
              className="py-3 border-b cursor-pointer text-green-600"
            >
              {cat}
            </p>
          ))}
        </div>
      )}

      {/* 🔥 HERO */}
      <div className="p-6">
        <div className="rounded-2xl p-8 bg-gradient-to-r from-green-700/30 to-transparent backdrop-blur-lg border border-white/10">

          <h2 className="text-3xl font-bold">
            Ramadan Sale 🌙
          </h2>

          <p className="text-gray-300 mt-2">
            Get 20% OFF on all halal products
          </p>

        </div>
      </div>

      {/* 🔥 CATEGORY SCROLL */}
      <div className="px-6 flex gap-3 overflow-x-auto pb-4">

        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              category === cat
                ? "bg-green-600"
                : "bg-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}

      </div>

      {/* 🔍 SEARCH */}
      <div className="px-6">
        <input
          placeholder="Search products..."
          className="w-full p-3 mb-6 bg-gray-800 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 🛍️ PRODUCTS */}
      <div className="px-6 grid md:grid-cols-3 gap-6 pb-10">

        {products
          .filter(p =>
            (category === "all" || p.category === category) &&
            p.name?.toLowerCase().includes(search.toLowerCase())
          )
          .map(product => (

            <div
              key={product.id}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition"
            >

              <Link href={`/product/${product.id}`}>
                <img
                  src={product.image || "/placeholder.png"}
                  className="w-full h-48 object-cover"
                />
              </Link>

              <div className="p-4">

                <h2 className="font-semibold text-lg">
                  {product.name}
                </h2>

                <p className="text-green-400 text-xl font-bold">
                  ¥{product.price}
                </p>

                <button
                  onClick={() => {
                    addToCart(product);
                    alert("Added 🛒");
                  }}
                  className="mt-3 w-full bg-green-600 py-2 rounded-lg hover:bg-green-500"
                >
                  Add to Cart
                </button>

              </div>
            </div>

          ))}

      </div>

    </main>
  );
}