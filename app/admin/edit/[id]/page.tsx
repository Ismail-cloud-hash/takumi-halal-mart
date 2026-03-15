"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProduct(){

  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [name,setName] = useState("");
  const [price,setPrice] = useState("");
  const [category,setCategory] = useState("");
  const [description,setDescription] = useState("");
  const [image,setImage] = useState("");
  const [file,setFile] = useState<File | null>(null);

  useEffect(()=>{

    async function fetchProduct(){

      const {data} = await supabase
        .from("products")
        .select("*")
        .eq("id",id)
        .single();

      if(data){
        setName(data.name);
        setPrice(data.price);
        setCategory(data.category);
        setDescription(data.description);
        setImage(data.image);
      }

    }

    fetchProduct();

  },[id]);


  async function updateProduct(){

    let imageUrl = image;

    if(file){

      const fileName = Date.now()+"-"+file.name;

      const {error:uploadError} = await supabase.storage
        .from("products")
        .upload(fileName,file);

      if(uploadError){
        alert("Image upload failed");
        return;
      }

      const {data} = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;

    }

    await supabase
      .from("products")
      .update({
        name,
        price,
        category,
        description,
        image:imageUrl
      })
      .eq("id",id);

    alert("Product Updated");

    router.push("/admin");
    router.refresh();

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

      <input
        className="w-full p-3 bg-gray-800 rounded mb-3"
        value={category}
        onChange={(e)=>setCategory(e.target.value)}
      />

      <input
        className="w-full p-3 bg-gray-800 rounded mb-3"
        value={description}
        onChange={(e)=>setDescription(e.target.value)}
      />


      {/* CURRENT IMAGE */}

      <p className="mt-4 mb-2">Current Image</p>

      <img
        src={image}
        className="w-32 rounded mb-4"
      />


      {/* NEW IMAGE */}

      <input
        type="file"
        onChange={(e)=>setFile(e.target.files?.[0] || null)}
      />

      {file && (
        <img
          src={URL.createObjectURL(file)}
          className="w-32 mt-3 rounded"
        />
      )}


      <button
        onClick={updateProduct}
        className="bg-green-600 px-6 py-3 rounded mt-6"
      >
        Update Product
      </button>


      <div className="mt-6">
        <Link href="/admin" className="text-blue-400">
          Back to Admin
        </Link>
      </div>

    </main>

  )

}