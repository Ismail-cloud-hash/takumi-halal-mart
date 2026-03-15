"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Image from "next/image";
import Link from "next/link";

export default function Home() {

  const [products,setProducts] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    async function fetchProducts(){

      const { data } = await supabase
        .from("products")
        .select("*")
        .order("id",{ascending:false});

      setProducts(data || []);
      setLoading(false);

    }

    fetchProducts();

  },[]);


  if(loading){
    return <p className="p-10">Loading products...</p>;
  }


  return(

    <main className="p-10">

      <div className="flex justify-between items-center mb-8">

        <div className="flex items-center gap-3">

          <Image
            src="/logo.png"
            alt="Takumi Halal Mart"
            width={40}
            height={40}
          />

          <h1 className="text-3xl font-bold text-green-700">
            Takumi Halal Mart
          </h1>

        </div>

        <Link
          href="/admin"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Admin
        </Link>

      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {products.map((product)=>(

          <div key={product.id} className="border rounded-lg p-4">

            <Link href={`/product/${product.id}`}>

              <img
                src={product.image}
                className="w-full h-40 object-cover rounded"
              />

              <h2 className="font-bold mt-3">
                {product.name}
              </h2>

            </Link>

            <p className="text-green-600">
              ¥{product.price}
            </p>

            <a
              href={`https://wa.me/94742440640?text=I want to order ${product.name}`}
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