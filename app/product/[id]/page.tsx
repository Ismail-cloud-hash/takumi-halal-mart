"use client";

import { useEffect,useState } from "react";
import { supabase } from "../../../supabase";
import { useParams } from "next/navigation";

export default function ProductPage(){

  const params = useParams();
  const id = params.id;

  const [product,setProduct] = useState<any>(null);

  useEffect(()=>{

    async function fetchProduct(){

      const {data} = await supabase
        .from("products")
        .select("*")
        .eq("id",id)
        .single();

      setProduct(data);

    }

    fetchProduct();

  },[id]);


  if(!product){
    return <p className="p-10">Loading...</p>;
  }


  return(

    <main className="p-10 max-w-3xl mx-auto">

      <a href="/" className="bg-gray-700 text-white px-4 py-2 rounded">
        Back
      </a>

      <img
        src={product.image}
        className="w-full h-80 object-cover rounded mt-6"
      />

      <h1 className="text-3xl font-bold mt-6">
        {product.name}
      </h1>

      <p className="text-green-600 text-xl mt-2">
        ¥{product.price}
      </p>

      <p className="mt-4 text-gray-300">
        {product.description}
      </p>

      <a
        href={`https://wa.me/94742440640?text=I want to order ${encodeURIComponent(product.name)}`}
        className="bg-green-600 text-white px-6 py-3 rounded mt-6 inline-block"
      >
        Order on WhatsApp
      </a>

    </main>

  );

}