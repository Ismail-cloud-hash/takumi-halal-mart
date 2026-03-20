"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Admin() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    checkUser();

    // 🔥 REALTIME
    const channel = supabase
      .channel("live-data")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.push("/login");
      return;
    }

    await fetchProducts();
    await fetchOrders();
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
    if (!file || !name || !price || !stock) {
      alert("Fill all fields ❌");
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
        stock: Number(stock),
        image: data.publicUrl,
      },
    ]);

    setName("");
    setPrice("");
    setStock("");
    setFile(null);

    fetchProducts();
  }

  async function deleteProduct(id: number) {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  }

  async function updateOrderStatus(id: number, status: string) {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <p className="p-6 text-white">Loading...</p>;

  // 🔥 DASHBOARD DATA
  const totalRevenue = orders.reduce((t, o) => t + o.total, 0);
  const lowStock = products.filter(p => p.stock < 5);

  const chartData = orders.map((o, i) => ({
    name: "Order " + (i + 1),
    total: o.total,
  }));

  return (
    <main className="bg-black text-white min-h-screen p-4 md:p-8 pb-20">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl text-green-400 font-bold">
          Dashboard
        </h1>
        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {/* 🔥 ALERT */}
      {lowStock.length > 0 && (
        <div className="bg-red-600 p-3 rounded mb-6">
          ⚠ Low Stock:
          {lowStock.map(p => (
            <p key={p.id}>{p.name} ({p.stock})</p>
          ))}
        </div>
      )}

      {/* 🔥 STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-gray-900 p-4 rounded">
          Products: {products.length}
        </div>

        <div className="bg-gray-900 p-4 rounded">
          Orders: {orders.length}
        </div>

        <div className="bg-gray-900 p-4 rounded col-span-2 md:col-span-1 text-green-400">
          Revenue: ¥{totalRevenue}
        </div>

      </div>

      {/* 🔥 CHART */}
      <div className="bg-gray-900 p-4 rounded mb-6">

        <h2 className="mb-3">Sales Chart 📊</h2>

        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* 🔥 ADD PRODUCT */}
      <div className="bg-gray-900 p-4 rounded mb-6">

        <input placeholder="Name" className="w-full mb-2 p-2 bg-gray-800" onChange={e=>setName(e.target.value)} />
        <input placeholder="Price" type="number" className="w-full mb-2 p-2 bg-gray-800" onChange={e=>setPrice(e.target.value)} />
        <input placeholder="Stock" type="number" className="w-full mb-2 p-2 bg-gray-800" onChange={e=>setStock(e.target.value)} />
        <input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} />

        <button onClick={addProduct} className="mt-3 w-full bg-green-600 py-2">
          Add Product
        </button>

      </div>

      {/* 🔥 PRODUCTS */}
      <h2 id="products" className="mb-3">Products</h2>

      {products.map(p => (
        <div key={p.id} className="bg-gray-900 p-3 mb-2 rounded flex justify-between">

          <div>
            <p>{p.name}</p>
            <p className="text-green-400">¥{p.price}</p>
            <p className={`text-xs ${p.stock < 5 ? "text-red-400" : ""}`}>
              Stock: {p.stock}
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={`/admin/edit/${p.id}`} className="bg-blue-600 px-2 py-1 text-sm">
              Edit
            </Link>
            <button onClick={()=>deleteProduct(p.id)} className="bg-red-600 px-2 py-1 text-sm">
              Delete
            </button>
          </div>

        </div>
      ))}

      {/* 🔥 ORDERS */}
      <h2 id="orders" className="mt-6 mb-3">Orders</h2>

      {orders.map(o => (
        <div key={o.id} className="bg-gray-900 p-3 mb-2 rounded">

          <p>{o.name}</p>

          {o.items?.map((i:any,index:number)=>(
            <p key={index} className="text-xs text-gray-400">
              {i.name} x {i.quantity}
            </p>
          ))}

          {/* STATUS */}
          <select
            value={o.status || "pending"}
            onChange={(e)=>updateOrderStatus(o.id, e.target.value)}
            className="bg-gray-800 mt-2"
          >
            <option value="pending">Pending</option>
            <option value="delivered">Delivered</option>
          </select>

          <p className="text-green-400">¥{o.total}</p>

        </div>
      ))}

      {/* 🔥 MOBILE NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 flex justify-around py-2 md:hidden">
        <button onClick={()=>window.scrollTo(0,0)}>🏠</button>
        <button onClick={()=>document.getElementById("products")?.scrollIntoView()}>📦</button>
        <button onClick={()=>document.getElementById("orders")?.scrollIntoView()}>🧾</button>
      </div>

    </main>
  );
}