"use client";

import { useEffect,useState } from "react";
import { supabase } from "../../../../supabase";
import { useParams,useRouter } from "next/navigation";

export default function EditProduct(){

  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [name,setName] = useState("");
  const [price,setPrice] = useState("");

  useEffect(()=>{

    async function fetchProduct(){

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id",id)
        .single();

      if(data){
        setName(data.name);
        setPrice(data.price);
      }

    }

    fetchProduct();

  },[id]);


  async function updateProduct(){

    await supabase
      .from("products")
      .update({
        name,
        price:Number(price)
      })
      .eq("id",id);

    alert("Updated");

    router.push("/admin");

  }


  return(

    <main className="p-10 max-w-md">

      <h1 className="text-3xl font-bold mb-6">
        Edit Product
      </h1>

      <input
        className="w-full p-3 bg-gray-800 rounded mb-3"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <input
        className="w-full p-3 bg-gray-800 rounded mb-3"
        value={price}
        onChange={(e)=>setPrice(e.target.value)}
      />

      <button
        onClick={updateProduct}
        className="bg-green-600 px-6 py-3 rounded"
      >
        Update Product
      </button>

    </main>

  );

}