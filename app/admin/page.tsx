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
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Fruits");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [message, setMessage] = useState("");

  const categories = ["Fruits","Halal Meat","Rice","Snacks","Drinks"];

  // ✅ LOAD TAB FROM LOCAL STORAGE (FIXED)
  useEffect(() => {
    const saved = localStorage.getItem("adminTab");
    if (saved) setTab(saved);
  }, []);

  function changeTab(t: string) {
    setTab(t);
    localStorage.setItem("adminTab", t);
  }

  // ✅ AUTH CHECK
  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return router.push("/login");

    fetchProducts();
    fetchOrders();
  }

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from("products").select("*");
    setProducts(data || []);
    setLoading(false);
  }

  async function fetchOrders() {
    const { data } = await supabase.from("orders").select("*");
    setOrders(data || []);
  }

  // ✅ REALTIME
  useEffect(() => {
    const channel = supabase
      .channel("live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        fetchProducts
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ IMAGE PREVIEW
  function handleFile(f: File | null) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  // ✅ ADD PRODUCT
  async function addProduct() {
    if (!file || !name || !price || !stock) {
      setMessage("Fill all fields ❌");
      return;
    }

    const fileName = Date.now() + file.name;

    await supabase.storage.from("products").upload(fileName, file);

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    await supabase.from("products").insert([{
      name,
      price: Number(price),
      stock: Number(stock),
      category,
      image: data.publicUrl,
    }]);

    setMessage("Added ✅");

    setName("");
    setPrice("");
    setStock("");
    setFile(null);
    setPreview("");

    fetchProducts();
  }

  // ✅ DELETE
  async function deleteProduct(id:number){
    if(!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id",id);
    fetchProducts();
  }

  // ✅ ORDER STATUS
  async function updateOrderStatus(id:number,status:string){
    await supabase.from("orders").update({status}).eq("id",id);
    fetchOrders();
  }

  const revenue = orders.reduce((t:any,o:any)=>t+o.total,0);

  const chartData = orders.map((o:any,i)=>({
    name:"O"+(i+1),
    total:o.total
  }));

  return (
    <main className="bg-black text-white min-h-screen pb-20">

      <div className="p-4 text-green-400 text-xl font-bold">
        Admin App
      </div>

      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 px-4 py-2 rounded">
          {message}
        </div>
      )}

      {/* DASHBOARD */}
      {tab==="dashboard" && (
        <div className="p-4 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 p-4 rounded-xl">
              Products: {products.length}
            </div>
            <div className="bg-gray-900 p-4 rounded-xl">
              Revenue: ¥{revenue}
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-xl h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip/>
                <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

      {/* PRODUCTS */}
      {tab==="products" && (
        <div className="p-4 space-y-3">

          <input
            placeholder="Search..."
            className="w-full p-3 bg-gray-800 rounded"
            onChange={(e)=>setSearch(e.target.value)}
          />

          <select
            className="w-full p-3 bg-gray-800 rounded"
            onChange={(e)=>setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>

          {/* ADD PRODUCT */}
          <div className="bg-gray-900 p-4 rounded-xl space-y-2">

            {preview && (
              <img src={preview} className="w-full h-32 object-cover rounded"/>
            )}

            <input className="w-full p-2 bg-gray-800" placeholder="Name" onChange={(e)=>setName(e.target.value)} />
            <input className="w-full p-2 bg-gray-800" placeholder="Price" type="number" onChange={(e)=>setPrice(e.target.value)} />
            <input className="w-full p-2 bg-gray-800" placeholder="Stock" type="number" onChange={(e)=>setStock(e.target.value)} />

            <select className="w-full p-2 bg-gray-800" onChange={(e)=>setCategory(e.target.value)}>
              {categories.map(c=><option key={c}>{c}</option>)}
            </select>

            <input type="file" onChange={(e)=>handleFile(e.target.files?.[0]||null)} />

            <button onClick={addProduct} className="bg-green-600 w-full py-2 rounded">
              Add Product
            </button>

          </div>

          {/* PRODUCT LIST */}
          {products
            .filter(p =>
              p.name?.toLowerCase().includes(search.toLowerCase()) &&
              (filterCategory==="all"||p.category===filterCategory)
            )
            .map(p=>(
              <div key={p.id} className="bg-gray-900 p-3 rounded flex gap-3 items-center">

                <img src={p.image} className="w-16 h-16 object-cover rounded"/>

                <div className="flex-1">
                  <p>{p.name}</p>
                  <p className="text-green-400">¥{p.price}</p>
                  <p className="text-xs text-gray-400">Stock: {p.stock}</p>
                </div>

                <button onClick={()=>router.push(`/admin/edit/${p.id}`)} className="bg-blue-600 px-3 py-1 rounded text-xs">
                  Edit
                </button>

                <button onClick={()=>deleteProduct(p.id)} className="bg-red-600 px-3 py-1 rounded text-xs">
                  Delete
                </button>

              </div>
            ))}

        </div>
      )}

      {/* ORDERS */}
      {tab==="orders" && (
        <div className="p-4 space-y-2">
          {orders.map((o:any)=>(
            <div key={o.id} className="bg-gray-900 p-3 rounded">

              <p>{o.name}</p>

              <select
                value={o.status || "pending"}
                onChange={(e)=>updateOrderStatus(o.id,e.target.value)}
                className="w-full bg-gray-800 mt-2 p-2 rounded"
              >
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
              </select>

              <p className="text-green-400 mt-2">¥{o.total}</p>

            </div>
          ))}
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 flex justify-around py-3 border-t border-gray-800">

        <button onClick={()=>changeTab("dashboard")} className={tab==="dashboard"?"text-green-400":"text-gray-400"}>
          Home
        </button>

        <button onClick={()=>changeTab("products")} className={tab==="products"?"text-green-400":"text-gray-400"}>
          Products
        </button>

        <button onClick={()=>changeTab("orders")} className={tab==="orders"?"text-green-400":"text-gray-400"}>
          Orders
        </button>

      </div>

    </main>
  );
}