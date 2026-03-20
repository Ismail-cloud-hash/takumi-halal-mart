"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../supabase";
import { useParams, useRouter } from "next/navigation";

export default function EditProduct() {
  const { id }: any = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setProduct(data));
  }, [id]);

  async function updateProduct() {
    let imageUrl = product.image;

    // 🔥 if new image uploaded
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
        name: product.name,
        price: Number(product.price),
        category: product.category,
        description: product.description,
        image: imageUrl,
      })
      .eq("id", id);

    alert("Updated ✅");
    router.push("/admin");
  }

  if (!product) return <p className="p-10 text-white">Loading...</p>;

  return (
    <main className="p-10 bg-black text-white min-h-screen max-w-md mx-auto">

      <h1 className="text-2xl mb-6">Edit Product</h1>

      <input
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
        className="w-full p-3 mb-3 bg-gray-800"
      />

      <input
        value={product.price}
        onChange={(e) => setProduct({ ...product, price: e.target.value })}
        className="w-full p-3 mb-3 bg-gray-800"
      />

      <textarea
        value={product.description}
        onChange={(e) => setProduct({ ...product, description: e.target.value })}
        className="w-full p-3 mb-3 bg-gray-800"
      />

      <img src={product.image} className="mb-3 h-40 w-full object-cover"/>

      <input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} />

      <button onClick={updateProduct} className="mt-4 w-full bg-green-600 py-3">
        Update Product
      </button>

    </main>
  );
}