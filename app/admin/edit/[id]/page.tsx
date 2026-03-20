"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../supabase";
import { useParams, useRouter } from "next/navigation";

export default function EditProduct() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Fruits");
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const categories = ["Fruits","Halal Meat","Rice","Snacks","Drinks"];

  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    if (message) {
      setTimeout(() => setMessage(""), 2000);
    }
  }, [message]);

  async function fetchProduct() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setName(data.name);
      setPrice(data.price);
      setStock(data.stock);
      setCategory(data.category);
      setImage(data.image);
    }
  }

  async function updateProduct() {
    let imageUrl = image;

    // 🔥 if new image selected
    if (file) {
      const fileName = Date.now() + file.name;

      await supabase.storage.from("products").upload(fileName, file);

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    await supabase
      .from("products")
      .update({
        name,
        price: Number(price),
        stock: Number(stock),
        category,
        image: imageUrl,
      })
      .eq("id", id);

    setMessage("Updated Successfully ✅");

    setTimeout(() => {
      router.push("/admin");
    }, 1000);
  }

  return (
    <main className="bg-black text-white min-h-screen p-4 max-w-md mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold text-green-400 mb-4">
        Edit Product
      </h1>

      {/* NOTIFICATION */}
      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 px-4 py-2 rounded">
          {message}
        </div>
      )}

      <div className="bg-gray-900 p-4 rounded-xl space-y-3">

        {/* IMAGE PREVIEW */}
        <img
          src={image}
          className="w-full h-40 object-cover rounded"
        />

        <input
          type="file"
          onChange={(e)=>setFile(e.target.files?.[0]||null)}
          className="w-full"
        />

        {/* NAME */}
        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className="w-full p-2 bg-gray-800 rounded"
          placeholder="Product Name"
        />

        {/* PRICE */}
        <input
          value={price}
          onChange={(e)=>setPrice(e.target.value)}
          type="number"
          className="w-full p-2 bg-gray-800 rounded"
          placeholder="Price"
        />

        {/* STOCK */}
        <input
          value={stock}
          onChange={(e)=>setStock(e.target.value)}
          type="number"
          className="w-full p-2 bg-gray-800 rounded"
          placeholder="Stock"
        />

        {/* CATEGORY */}
        <select
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
          className="w-full p-2 bg-gray-800 rounded"
        >
          {categories.map(c=>(
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* BUTTONS */}
        <button
          onClick={updateProduct}
          className="w-full bg-green-600 py-2 rounded"
        >
          Save Changes
        </button>

        <button
          onClick={()=>router.push("/admin")}
          className="w-full bg-gray-700 py-2 rounded"
        >
          Back
        </button>

      </div>

    </main>
  );
}