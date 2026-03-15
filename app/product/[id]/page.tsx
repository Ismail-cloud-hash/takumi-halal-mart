"use client";

import { useEffect,useState } from "react";
import { supabase } from "../../../supabase";
import { useParams } from "next/navigation";

export default function ProductPage(){

  const params = useParams();
  const id = Number(params.id);

  const [product,setProduct] = useState<any>(null);

  useEffect(()=>{

    async function fetchProduct(){

      const { data } = await supabase
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

    <main className="p-10">

      <img
        src={product.image}
        className="w-full h-80 object-cover rounded"
      />

      <h1 className="text-3xl font-bold mt-6">
        {product.name}
      </h1>

      <p className="text-green-600 text-xl mt-2">
        ¥{product.price}
      </p>

      <p className="mt-4">
        {product.description}
      </p>

    </main>

  );

}