"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Link from "next/link";
import { addToCart, getCartCount } from "../lib/cart";

const categoryData = [
  {
    name: "Fruits",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf",
    sub: ["Apple", "Orange", "Banana"]
  },
  {
    name: "Halal Meat",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f",
    sub: ["Chicken", "Beef", "Mutton"]
  },
  {
    name: "Rice",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    sub: ["Basmati", "White Rice"]
  },
  {
    name: "Snacks",
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087",
    sub: ["Chips", "Biscuits"]
  },
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sidebar, setSidebar] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);

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

  return (
    <main className="bg-black text-white min-h-screen">

      {/* 🔥 STICKY HEADER */}
      <div className="sticky top-0 z-40 flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">

        <button onClick={() => setSidebar(true)} className="text-2xl">☰</button>

        <h1 className="text-green-400 font-bold">Takumi Mart</h1>

        <div className="flex gap-4 items-center">
          <Link href="/login">Admin</Link>

          <Link href="/cart" className="relative">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 px-2 text-xs rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 🔥 SIDEBAR WITH SUBCATEGORIES */}
      {sidebar && (
        <div className="fixed top-0 left-0 w-72 h-full bg-white text-black z-50 p-4 overflow-y-auto">

          <button onClick={() => setSidebar(false)} className="mb-4">✖</button>

          {categoryData.map(cat => (
            <div key={cat.name} className="mb-4">

              <div
                className="flex justify-between cursor-pointer"
                onClick={() =>
                  setOpenCat(openCat === cat.name ? null : cat.name)
                }
              >
                <span className="text-green-600 font-semibold">
                  {cat.name}
                </span>
                <span>▼</span>
              </div>

              {openCat === cat.name && (
                <div className="ml-4 mt-2 text-sm">
                  {cat.sub.map(sub => (
                    <p
                      key={sub}
                      onClick={() => {
                        setCategory(cat.name);
                        setSidebar(false);
                      }}
                      className="py-1 cursor-pointer"
                    >
                      {sub}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}

        </div>
      )}

      {/* 🔥 HERO */}
      <div className="p-6">
        <div className="bg-green-700 rounded-xl p-6 text-center">
          <h2 className="text-3xl font-bold">
            Fresh Halal Grocery 🛒
          </h2>
          <p>Fast delivery & best quality</p>
        </div>
      </div>

      {/* 🔥 CATEGORY IMAGE GRID */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-6">

        {categoryData.map(cat => (
          <div
            key={cat.name}
            onClick={() => setCategory(cat.name)}
            className="relative rounded-xl overflow-hidden cursor-pointer"
          >
            <img src={cat.image} className="h-28 w-full object-cover"/>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <p className="font-bold">{cat.name}</p>
            </div>
          </div>
        ))}

      </div>

      {/* 🔍 SEARCH */}
      <div className="px-6">
        <input
          placeholder="Search..."
          className="w-full p-3 bg-gray-800 rounded mb-6"
          onChange={(e)=>setSearch(e.target.value)}
        />
      </div>

      {/* 🛍️ PRODUCTS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-6 pb-10">

        {products
          .filter(p =>
            (category==="all"||p.category===category) &&
            p.name?.toLowerCase().includes(search.toLowerCase())
          )
          .map(product => (

            <div key={product.id} className="bg-gray-900 rounded-xl overflow-hidden">

              <div className="relative">
                <img src={product.image} className="h-36 w-full object-cover"/>

                {/* 🔥 BADGE */}
                <span className="absolute top-2 left-2 bg-red-500 text-xs px-2 rounded">
                  SALE
                </span>
              </div>

              <div className="p-3">

                <h2 className="text-sm">{product.name}</h2>

                <p className="text-green-400 font-bold">
                  ¥{product.price}
                </p>

                <button
                  onClick={()=>addToCart(product)}
                  className="mt-2 w-full bg-green-600 py-2 rounded text-sm"
                >
                  Add
                </button>

              </div>

            </div>

          ))}

      </div>

    </main>
  );
}