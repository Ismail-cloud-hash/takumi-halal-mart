"use client";

import { addToCart } from "../lib/cart";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

      setProducts(data || []);
    }

    fetchProducts();
  }, []);

  return (
    <main className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-500">
          Takumi Halal Mart
        </h1>

        <Link
          href="/admin"
          className="bg-green-600 px-4 py-2 rounded text-white"
        >
          Admin
        </Link>
      </div>

      {/* HERO */}
      <div className="mb-8 rounded-xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1606787366850-de6330128bfc"
          className="w-full h-60 object-cover"
        />
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search products..."
        className="w-full p-3 mb-6 rounded bg-gray-800"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* PRODUCTS */}
      <div className="grid md:grid-cols-3 gap-6">

        {products
          .filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((product) => (

            <div
              key={product.id}
              className="bg-gray-900 rounded-xl overflow-hidden shadow hover:scale-105 transition"
            >

              <Link href={`/product/${product.id}`}>

                <img
                  src={product.image}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <h2 className="text-lg font-semibold">
                    {product.name}
                  </h2>

                  <p className="text-green-500 font-bold mt-2">
                    ¥{product.price}
                  </p>
                </div>

              </Link>

            </div>

          ))}

      </div>

    </main>
  );
}