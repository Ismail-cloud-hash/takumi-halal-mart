"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Link from "next/link";

export default function Home(){

  const [products,setProducts] = useState<any[]>([]);

  useEffect(()=>{

    async function fetchProducts(){

      const { data } = await supabase
        .from("products")
        .select("*")
        .order("id",{ascending:false});

      setProducts(data || []);

    }

    fetchProducts();

  },[]);


  return(

    <main className="p-10">

      <div className="flex justify-between mb-8">

        <h1 className="text-3xl font-bold text-green-700">
          Takumi Halal Mart
        </h1>

        <Link
          href="/admin"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Admin
        </Link>

      </div>


      <div className="grid grid-cols-3 gap-6">

        {products.map((product)=>(

          <div key={product.id} className="border p-4 rounded">

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

          </div>

        ))}

      </div>

    </main>

  );

}