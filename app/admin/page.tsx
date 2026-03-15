"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export default function Admin(){

  const [name,setName]=useState("");
  const [price,setPrice]=useState("");
  const [category,setCategory]=useState("");
  const [description,setDescription]=useState("");
  const [file,setFile]=useState<File | null>(null);

  const [products,setProducts]=useState<any[]>([]);

  async function fetchProducts(){

    const {data}=await supabase
      .from("products")
      .select("*")
      .order("id",{ascending:false});

    setProducts(data || []);

  }

  useEffect(()=>{
    fetchProducts();
  },[]);

  async function addProduct(){

    if(!file){
      alert("Select image");
      return;
    }

    const fileName=Date.now()+"-"+file.name;

    const {error:uploadError}=await supabase.storage
      .from("products")
      .upload(fileName,file);

    if(uploadError){
      alert("Image upload failed");
      return;
    }

    const {data}=supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    await supabase
      .from("products")
      .insert([
        {
          name,
          price,
          category,
          description,
          image:data.publicUrl
        }
      ]);

    setName("");
    setPrice("");
    setCategory("");
    setDescription("");
    setFile(null);

    fetchProducts();

  }

  async function deleteProduct(id:number){

    await supabase
      .from("products")
      .delete()
      .eq("id",id);

    fetchProducts();

  }

  return(

    <main className="p-10">

      <div className="flex justify-between mb-8">

        <h1 className="text-3xl font-bold text-green-700">
          Admin Panel
        </h1>

        <a href="/" className="bg-gray-700 text-white px-4 py-2 rounded">
          Back to Store
        </a>

      </div>

      {/* ADD PRODUCT */}

      <div className="max-w-md space-y-4">

        <input
          placeholder="Product Name"
          className="w-full p-3 bg-gray-800 rounded"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          placeholder="Price"
          className="w-full p-3 bg-gray-800 rounded"
          value={price}
          onChange={(e)=>setPrice(e.target.value)}
        />

        <select
          className="w-full p-3 bg-gray-800 rounded"
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Rice">Rice</option>
          <option value="Meat">Meat</option>
          <option value="Vegetable">Vegetable</option>
          <option value="Frozen">Frozen</option>
          <option value="Grocery">Grocery</option>
        </select>

        <input
          placeholder="Description"
          className="w-full p-3 bg-gray-800 rounded"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
        />

        <input
          type="file"
          onChange={(e)=>setFile(e.target.files?.[0] || null)}
        />

        {file && (
          <img
            src={URL.createObjectURL(file)}
            className="w-32 rounded"
          />
        )}

        <button
          onClick={addProduct}
          className="bg-green-600 w-full py-3 rounded"
        >
          Add Product
        </button>

      </div>

      {/* PRODUCT LIST */}

      <h2 className="text-2xl mt-12 mb-6">
        Product List
      </h2>

      {products.map((product)=>(

        <div
          key={product.id}
          className="flex justify-between items-center bg-gray-900 p-4 mb-3 rounded"
        >

          <div className="flex items-center gap-4">

            <img
              src={product.image}
              className="w-16 h-16 object-cover rounded"
            />

            <div>

              <p className="font-bold">
                {product.name}
              </p>

              <p className="text-gray-400">
                ¥{product.price}
              </p>

            </div>

          </div>

          <button
            onClick={()=>deleteProduct(product.id)}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Delete
          </button>

        </div>

      ))}

    </main>

  );

}