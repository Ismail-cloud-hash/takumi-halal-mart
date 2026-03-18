"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import { useParams } from "next/navigation";

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

      <div className="grid md:grid-cols-2 gap-10">

        <img
          src={product.image}
          className="w-full rounded-xl"
        />

        <div>

          <h1 className="text-4xl font-bold">
            {product.name}
          </h1>

          <p className="text-green-500 text-2xl mt-3">
            ¥{product.price}
          </p>

          <p className="mt-6 text-gray-300">
            {product.description}
          </p>

          <button className="mt-6 bg-green-600 px-6 py-3 rounded">
            Add to Cart
          </button>

        </div>

      </div>

    </main>
  );
}