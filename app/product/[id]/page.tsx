"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import { useParams } from "next/navigation";
import { addToCart } from "../../../lib/cart";

export default function ProductPage() {
  const { id }: any = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(()=>{
    supabase.from("products").select("*").eq("id",id).single()
      .then(({data})=>setProduct(data));
  },[id]);

  if(!product) return <p>Loading...</p>;

  return (
    <main className="p-10 bg-black text-white min-h-screen">

      <img src={product.image} className="w-full h-80 object-cover"/>

      <h1 className="text-2xl mt-4">{product.name}</h1>
      <p className="text-green-400">¥{product.price}</p>

      <button onClick={()=>addToCart(product)} className="mt-4 bg-green-600 px-6 py-2">
        Add to Cart
      </button>

    </main>
  );
}