"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useRouter } from "next/navigation";

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

  const [tab, setTab] = useState("dashboard");

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Fruits");
  const [file, setFile] = useState<File | null>(null);

  const categories = ["Fruits","Halal Meat","Rice","Snacks","Drinks"];

  useEffect(() => {
    checkUser();

    const channel = supabase
      .channel("live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        fetchProducts
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return router.push("/login");

    fetchProducts();
    fetchOrders();
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
        category,
        image: data.publicUrl,
      },
    ]);

    setName("");
    setPrice("");
    setStock("");
    setFile(null);

    fetchProducts();
  }

  async function updateOrderStatus(id: number, status: string) {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
  }

  // 📊 chart data
  const chartData = orders.map((o, i) => ({
    name: "O" + (i + 1),
    total: o.total,
  }));

  const revenue = orders.reduce((t, o) => t + o.total, 0);
  const lowStock = products.filter(p => p.stock < 5);

  return (
    <main className="bg-black text-white min-h-screen pb-20">

      {/* HEADER */}
      <div className="p-4 text-xl font-bold text-green-400">
        Admin App
      </div>

      {/* 🔥 DASHBOARD TAB */}
      {tab === "dashboard" && (
        <div className="p-4">

          {/* STATS */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-900 p-3 rounded">
              Products: {products.length}
            </div>
            <div className="bg-gray-900 p-3 rounded">
              Revenue: ¥{revenue}
            </div>
          </div>

          {/* LOW STOCK */}
          {lowStock.length > 0 && (
            <div className="bg-red-600 p-3 rounded mb-4 text-sm">
              ⚠ Low Stock:
              {lowStock.map(p=>(
                <p key={p.id}>{p.name} ({p.stock})</p>
              ))}
            </div>
          )}

          {/* CHART */}
          <div className="bg-gray-900 p-3 rounded h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#22c55e" />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

      {/* 🔥 PRODUCTS TAB */}
      {tab === "products" && (
        <div className="p-4">

          {/* ADD */}
          <div className="bg-gray-900 p-3 rounded mb-4 space-y-2">
            <input placeholder="Name" className="w-full p-2 bg-gray-800"
              onChange={(e)=>setName(e.target.value)} />
            <input placeholder="Price" type="number" className="w-full p-2 bg-gray-800"
              onChange={(e)=>setPrice(e.target.value)} />
            <input placeholder="Stock" type="number" className="w-full p-2 bg-gray-800"
              onChange={(e)=>setStock(e.target.value)} />

            <select className="w-full p-2 bg-gray-800"
              onChange={(e)=>setCategory(e.target.value)}>
              {categories.map(c=><option key={c}>{c}</option>)}
            </select>

            <input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} />

            <button onClick={addProduct} className="bg-green-600 w-full py-2">
              Add Product
            </button>
          </div>

          {/* LIST */}
          {products.map(p=>(
            <div key={p.id} className="bg-gray-900 p-3 rounded mb-2 flex gap-3">

              {/* IMAGE */}
              <img src={p.image} className="w-16 h-16 object-cover rounded"/>

              <div className="flex-1">
                <p>{p.name}</p>
                <p className="text-green-400">¥{p.price}</p>
                <p className="text-xs">{p.category}</p>
              </div>

              <div className="text-xs">
                <p className={p.stock<5?"text-red-400":""}>
                  {p.stock}
                </p>
              </div>

            </div>
          ))}

        </div>
      )}

      {/* 🔥 ORDERS TAB */}
      {tab === "orders" && (
        <div className="p-4">

          {orders.map(o=>(
            <div key={o.id} className="bg-gray-900 p-3 mb-2 rounded">

              <p>{o.name}</p>

              {o.items?.map((i:any,index:number)=>(
                <p key={index} className="text-xs text-gray-400">
                  {i.name} x {i.quantity}
                </p>
              ))}

              <select
                value={o.status || "pending"}
                onChange={(e)=>updateOrderStatus(o.id,e.target.value)}
                className="w-full mt-2 bg-gray-800"
              >
                <option value="pending">🟡 Pending</option>
                <option value="delivered">🟢 Delivered</option>
              </select>

              <p className="text-green-400">¥{o.total}</p>

            </div>
          ))}

        </div>
      )}

      {/* 🔥 MOBILE TAB BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 flex justify-around py-3 text-sm">

        <button onClick={()=>setTab("dashboard")}>
          📊<br/>Home
        </button>

        <button onClick={()=>setTab("products")}>
          📦<br/>Products
        </button>

        <button onClick={()=>setTab("orders")}>
          🧾<br/>Orders
        </button>

      </div>

    </main>
  );
}