"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import Link from "next/link";

export default function Admin() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    setProducts(data || []);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function addProduct() {

    if (!file || !name || !price) {
      alert("Fill all fields");
      return;
    }

    const fileName = Date.now() + "-" + file.name;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, file);

    if (uploadError) {
      alert("Upload failed");
      return;
    }

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    const { error } = await supabase
      .from("products")
      .insert([
        {
          name,
          price: Number(price),
          category,
          description,
          image: data.publicUrl,
        },
      ]);

    if (error) {
      alert("Insert failed");
      return;
    }

    alert("Product Added ✅");

    setName("");
    setPrice("");
    setCategory("");
    setDescription("");
    setFile(null);

    fetchProducts();
  }

  async function deleteProduct(id: number) {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  }

  return (
    <main className="p-10">

      <div className="flex justify-between mb-8">
        <h1 className="text-3xl text-green-500 font-bold">
          Admin Panel
        </h1>

        <Link href="/" className="bg-gray-700 px-4 py-2 rounded">
          Back
        </Link>
      </div>

      <div className="max-w-md space-y-4">

        <input
          placeholder="Product Name"
          className="w-full p-3 bg-gray-800 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Price"
          className="w-full p-3 bg-gray-800 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Category"
          className="w-full p-3 bg-gray-800 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          placeholder="Description"
          className="w-full p-3 bg-gray-800 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={addProduct}
          className="bg-green-600 w-full py-3 rounded"
        >
          Add Product
        </button>

      </div>

      <h2 className="text-2xl mt-10 mb-4">
        Product List
      </h2>

      {products.map((product) => (
        <div
          key={product.id}
          className="flex justify-between bg-gray-900 p-4 mb-3 rounded"
        >
          <div>
            <p className="font-bold">{product.name}</p>
            <p>¥{product.price}</p>
          </div>

          <button
            onClick={() => deleteProduct(product.id)}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      ))}

    </main>
  );
}