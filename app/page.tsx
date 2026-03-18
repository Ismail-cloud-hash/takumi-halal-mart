"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Link from "next/link";
import { addToCart, getCartCount } from "../lib/cart";

export default function Home() {

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchProducts();
    setCartCount(getCartCount());
  }, []);

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    setProducts(data || []);
  }

  const categories = ["All", "Fruits", "Meat", "Rice", "Spices", "Drinks"];

  return (
    <main className="bg-white text-black min-h-screen">

      {/* HEADER */}
      <div className="bg-gray-900 p-4 flex flex-col md:flex-row justify-between items-center gap-4">

        <h1 className="text-2xl font-bold text-green-500">
          Takumi Halal Mart
        </h1>

        <input
          placeholder="Search products..."
          className="w-full md:w-1/2 p-2 rounded bg-gray-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-4 items-center">

          <Link href="/cart" className="relative bg-green-600 px-4 py-2 rounded">

            Cart 🛒

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-xs px-2 py-1 rounded-full">
                {cartCount}
              </span>
            )}

          </Link>

          <Link href="/login" className="bg-gray-700 px-4 py-2 rounded">
            Admin ⚙️
          </Link>

        </div>

      </div>

      {/* HERO */}
      <div className="p-4">
        <img
          src="https://images.unsplash.com/photo-1606787366850-de6330128bfc"
          className="w-full h-48 md:h-64 object-cover rounded-xl"
        />
      </div>

      {/* SLIDER (HORIZONTAL SCROLL) */}
      <div className="px-4 mb-6 overflow-x-auto flex gap-4">

        {products.slice(0, 6).map((product) => (

          <div key={product.id} className="min-w-[200px] bg-gray-900 p-3 rounded">

            <img
              src={product.image}
              className="w-full h-28 object-cover rounded"
            />

            <p className="mt-2 text-sm">{product.name}</p>

          </div>

        ))}

      </div>

      {/* MAIN LAYOUT */}
      <div className="flex">

        {/* SIDEBAR */}
        <div className="w-1/4 hidden md:block p-4">

          <h2 className="text-xl mb-4">Categories</h2>

          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => setCategory(cat)}
              className={`p-2 mb-2 cursor-pointer rounded ${
                category === cat ? "bg-green-600" : "bg-gray-900"
              }`}
            >
              {cat}
            </div>
          ))}

        </div>

        {/* PRODUCTS */}
        <div className="w-full md:w-3/4 p-4">

          <h2 className="text-2xl mb-4">Products</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

            {products
              .filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
              )
              .filter((p) =>
                category === "All" ? true : p.category === category
              )
              .map((product) => (

                <div
                  key={product.id}
                  className="bg-gray-900 p-4 rounded hover:scale-105 transition relative"
                >

                  {/* ❤️ Wishlist icon */}
                  <div className="absolute top-2 right-2 cursor-pointer">
                    ❤️
                  </div>

                  <Link href={`/product/${product.id}`}>

                    <img
                      src={product.image}
                      className="w-full h-40 object-cover rounded"
                    />

                    <h2 className="mt-3 font-bold">
                      {product.name}
                    </h2>

                  </Link>

                  <p className="text-green-500 font-bold">
                    ¥{product.price}
                  </p>

                  <button
                    onClick={() => {
                      addToCart(product);
                      setCartCount(getCartCount());
                      alert("Added to cart 🛒");
                    }}
                    className="mt-3 w-full bg-green-600 py-2 rounded hover:bg-green-700"
                  >
                    Add to Cart
                  </button>

                </div>

              ))}

          </div>

        </div>

      </div>

    </main>
  );
}