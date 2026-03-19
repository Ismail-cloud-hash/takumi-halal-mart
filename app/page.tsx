"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Link from "next/link";
import { addToCart, getCartCount } from "../lib/cart";

export default function Home() {

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

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

  return (
    <main className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl text-green-500 font-bold">
          Takumi Halal Mart
        </h1>

        <div className="flex gap-4 items-center">

          {/* CART */}
          <Link href="/cart" className="relative bg-green-600 px-4 py-2 rounded">

            Cart 🛒

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-xs px-2 py-1 rounded-full">
                {cartCount}
              </span>
            )}

          </Link>

          {/* ADMIN */}
          <Link href="/login" className="bg-gray-700 px-4 py-2 rounded">
            Admin ⚙️
          </Link>

        </div>

      </div>

      {/* SEARCH */}
      <input
        placeholder="Search products..."
        className="w-full p-3 mb-6 bg-gray-800 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* PRODUCTS */}
      <div className="grid md:grid-cols-3 gap-6">

        {products
          .filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((product) => (

            <div key={product.id} className="bg-gray-900 p-4 rounded">

              <Link href={`/product/${product.id}`}>

                <img
                  src={product.image}
                  className="w-full h-40 object-cover rounded"
                />

                <h2 className="mt-3 font-bold">
                  {product.name}
                </h2>

              </Link>

              <p className="text-green-500">
                ¥{product.price}
              </p>

              <button
                onClick={() => {
                  addToCart(product);
                  setCartCount(getCartCount()); // 🔥 update badge
                  alert("Added to cart 🛒");
                }}
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