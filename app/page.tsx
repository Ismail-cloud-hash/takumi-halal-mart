"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Home() {

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchProducts() {

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

      if (!error) {
        setProducts(data || []);
      }

      setLoading(false);

    }

    fetchProducts();

  }, []);

  const filteredProducts = products.filter((p) => {

    const matchCategory =
      category === "All" ||
      p.category?.toLowerCase() === category.toLowerCase();

    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchSearch;

  });

  if (loading) {
    return <p className="p-10">Loading products...</p>;
  }

  return (

    <main className="p-10">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold text-green-700">
          Takumi Halal Mart
        </h1>

        <a
          href="/admin"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Admin
        </a>

      </div>

      {/* SEARCH */}

      <input
        placeholder="Search products..."
        className="w-full p-3 bg-gray-800 rounded mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* CATEGORY */}

      <div className="flex flex-wrap gap-3 mb-8">

        {["All","Rice","Meat","Vegetable","Frozen","Grocery"].map((cat)=>(
          
          <button
            key={cat}
            onClick={()=>setCategory(cat)}
            className={`px-4 py-2 rounded ${
              category===cat
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-white"
            }`}
          >
            {cat}
          </button>

        ))}

      </div>

      {/* PRODUCTS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredProducts.map((product)=>(

          <div key={product.id} className="border rounded-lg p-4">

            <a href={`/product/${product.id}`}>

              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover rounded"
              />

              <h2 className="font-bold mt-3">
                {product.name}
              </h2>

            </a>

            <p className="text-green-600">
              ¥{product.price}
            </p>

            <a
              href={`https://wa.me/94742440640?text=I want to order ${encodeURIComponent(product.name)}`}
              target="_blank"
              className="bg-green-600 text-white px-4 py-2 mt-3 inline-block rounded"
            >
              Order on WhatsApp
            </a>

          </div>

        ))}

      </div>

    </main>
  );
}