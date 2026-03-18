"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import { useParams } from "next/navigation";
import { addToCart } from "../../../lib/cart";

export default function ProductPage() {

  const params = useParams();
  const id = Number(params.id);

  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      setProduct(data);
    }

    fetchProduct();
  }, [id]);

  if (!product) return <p className="p-10">Loading...</p>;

  return (
    <main className="p-10">

      <img
        src={product.image}
        className="w-full h-80 object-cover rounded"
      />

      <h1 className="text-3xl mt-6 font-bold">
        {product.name}
      </h1>

      <p className="text-green-500 text-xl mt-2">
        ¥{product.price}
      </p>

      <p className="mt-4">
        {product.description}
      </p>

      <button
        onClick={() => {
          addToCart(product);
          alert("Added to cart 🛒");
        }}
        className="mt-6 bg-green-600 px-6 py-3 rounded"
      >
        Add to Cart
      </button>

    </main>
  );
}