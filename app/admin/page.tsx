"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const categories = [
  "Fruits",
  "Halal Meat",
  "Rice",
  "Snacks",
  "Drinks",
  "Frozen Foods",
];

export default function Admin() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
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

    fetchProducts();
    fetchOrders();
    setLoading(false);
  }

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*");
    setProducts(data || []);
  }

  async function fetchOrders() {
    const { data } = await supabase.from("orders").select("*");
    setOrders(data || []);
  }

  async function addProduct() {
    if (!file || !name || !price) {
      alert("Fill all fields");
      return;
    }

    const fileName = Date.now() + file.name;

    await supabase.storage.from("products").upload(fileName, file);

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    await supabase.from("products").insert([
      {
        name,
        price: Number(price),
        category,
        description,
        image: data.publicUrl,
      },
    ]);

    alert("Added ✅");

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
    <main className="bg-gradient-to-br from-black to-gray-900 text-white min-h-screen p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl text-green-400 font-bold">
          Admin Dashboard
        </h1>

        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {/* ADD PRODUCT CARD */}
      <div className="bg-white/5 p-6 rounded-xl backdrop-blur mb-10">

        <h2 className="mb-4 font-bold text-lg">Add Product</h2>

        <input
          placeholder="Name"
          className="w-full p-3 mb-3 bg-gray-800 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Price"
          type="number"
          className="w-full p-3 mb-3 bg-gray-800 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <select
          className="w-full p-3 mb-3 bg-gray-800 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <textarea
          placeholder="Description"
          className="w-full p-3 mb-3 bg-gray-800 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

        <button onClick={addProduct} className="mt-4 w-full bg-green-600 py-3 rounded">
          Add Product
        </button>

      </div>

      {/* PRODUCTS */}
      <h2 className="text-xl mb-4">Products</h2>

      <div className="grid md:grid-cols-2 gap-4">

        {products.map((p) => (
          <div key={p.id} className="bg-gray-900 p-4 rounded-xl flex justify-between">

            <div>
              <p className="font-bold">{p.name}</p>
              <p className="text-green-400">¥{p.price}</p>
              <p className="text-sm text-gray-400">{p.category}</p>
            </div>

            <div className="flex flex-col gap-2">
              <Link href={`/admin/edit/${p.id}`} className="bg-blue-600 px-3 py-1 rounded">
                Edit
              </Link>

              <button
                onClick={() => deleteProduct(p.id)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>

          </div>
        ))}

      </div>

      {/* ORDERS */}
      <h2 className="text-xl mt-10 mb-4">Orders</h2>

      {orders.map((o) => (
        <div key={o.id} className="bg-gray-900 p-4 mb-3 rounded-xl">

          <p>{o.name}</p>
          <p className="text-sm">{o.phone}</p>

          {o.items?.map((item: any, i: number) => (
            <p key={i} className="text-xs text-gray-400">
              {item.name} x {item.quantity}
            </p>
          ))}

          <p className="text-green-400 font-bold">¥{o.total}</p>

        </div>
      ))}

    </main>
  );
}