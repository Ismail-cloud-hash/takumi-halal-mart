"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";
import Link from "next/link";

const categoryOptions = [
  "Fruits",
  "Halal Meat",
  "Rice",
  "Snacks",
  "Drinks",
  "Frozen Foods",
];

export default function Admin() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.push("/login");
      return;
    }

    setLoading(false);
    fetchProducts();
    fetchOrders();
  }

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    setProducts(data || []);
  }

  async function fetchOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    setOrders(data || []);
  }

  async function addProduct() {
    if (!file || !name || !price) {
      alert("Fill all fields ❌");
      return;
    }

    const fileName = Date.now() + "-" + file.name;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, file);

    if (uploadError) {
      alert("Upload failed ❌");
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    await supabase.from("products").insert([
      {
        name,
        price: Number(price),
        category,
        description,
        image: imageUrl,
      },
    ]);

    alert("Product Added ✅");

    setName("");
    setPrice("");
    setDescription("");
    setFile(null);

    fetchProducts();
  }

  async function deleteProduct(id: number) {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <p className="p-10 text-white">Loading...</p>;

  return (
    <main className="p-10 bg-gradient-to-br from-black to-gray-900 text-white min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl text-green-400 font-bold">
          Admin Panel
        </h1>

        <div className="flex gap-3">
          <Link href="/" className="bg-gray-700 px-4 py-2 rounded">
            Home
          </Link>

          <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </div>

      {/* ADD PRODUCT */}
      <div className="max-w-md space-y-4 mb-10 bg-white/5 p-6 rounded-xl backdrop-blur">

        <input
          placeholder="Product Name"
          className="w-full p-3 bg-gray-800 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Price"
          type="number"
          className="w-full p-3 bg-gray-800 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* 🔥 CATEGORY DROPDOWN */}
        <select
          className="w-full p-3 bg-gray-800 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoryOptions.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <textarea
          placeholder="Description"
          className="w-full p-3 bg-gray-800 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

        <button
          onClick={addProduct}
          className="bg-green-600 w-full py-3 rounded"
        >
          Add Product
        </button>
      </div>

      {/* PRODUCTS */}
      <h2 className="text-2xl mb-4">Products 🛍️</h2>

      {products.map((product) => (
        <div
          key={product.id}
          className="flex justify-between bg-gray-900 p-4 mb-3 rounded"
        >
          <div>
            <p className="font-bold">{product.name}</p>
            <p className="text-green-400">¥{product.price}</p>
            <p className="text-sm text-gray-400">{product.category}</p>
          </div>

          <button
            onClick={() => deleteProduct(product.id)}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      ))}

      {/* ORDERS */}
      <h2 className="text-2xl mt-10 mb-4">Orders 📦</h2>

      {orders.map((order) => (
        <div key={order.id} className="bg-gray-900 p-4 mb-3 rounded">

          <p><strong>{order.name}</strong></p>
          <p>{order.phone}</p>
          <p className="text-sm text-gray-400">{order.address}</p>

          {/* 🔥 SHOW ITEMS */}
          {order.items?.map((item: any, i: number) => (
            <p key={i} className="text-sm text-gray-500">
              {item.name} x {item.quantity}
            </p>
          ))}

          <p className="text-green-400 font-bold mt-2">
            ¥{order.total}
          </p>

        </div>
      ))}

    </main>
  );
}