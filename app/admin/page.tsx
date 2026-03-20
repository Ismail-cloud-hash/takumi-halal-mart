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

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editProduct, setEditProduct] = useState<any>(null);
  const [message, setMessage] = useState("");

  const categories = ["Fruits","Halal Meat","Rice","Snacks","Drinks"];

  useEffect(() => {
    (async () => {
      await checkUser();
    })();

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

  useEffect(() => {
    if (message) {
      setTimeout(() => setMessage(""), 2000);
    }
  }, [message]);

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
      setMessage("Fill all fields ❌");
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

    setMessage("Product Added ✅");

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

  const chartData = orders.map((o, i) => ({
    name: "O" + (i + 1),
    total: o.total,
  }));

  const revenue = orders.reduce((t, o) => t + o.total, 0);

  return (
    <main className="bg-black text-white min-h-screen pb-20">

      {/* HEADER */}
      <div className="p-4 text-xl font-bold text-green-400">
        Admin App
      </div>

      {/* NOTIFICATION */}
      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 px-4 py-2 rounded z-50">
          {message}
        </div>
      )}

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div className="p-4">

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-900 p-3 rounded">
              Products: {products.length}
            </div>
            <div className="bg-gray-900 p-3 rounded">
              Revenue: ¥{revenue}
            </div>
          </div>

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

      {/* PRODUCTS */}
      {tab === "products" && (
        <div className="p-4">

          {/* SEARCH */}
          <input
            placeholder="Search..."
            className="w-full p-2 bg-gray-800 mb-2 rounded"
            onChange={(e)=>setSearch(e.target.value)}
          />

          {/* FILTER */}
          <select
            className="w-full p-2 bg-gray-800 mb-3 rounded"
            onChange={(e)=>setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>

          {/* ADD PRODUCT */}
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

            <button onClick={addProduct} className="bg-green-600 w-full py-2 rounded">
              Add Product
            </button>
          </div>

          {/* PRODUCT LIST */}
          <div className="space-y-3">
            {products
              .filter(p =>
                p.name?.toLowerCase().includes(search.toLowerCase()) &&
                (filterCategory==="all"||p.category===filterCategory)
              )
              .map(p=>(
                <div key={p.id} className="bg-gray-900 rounded-xl p-3 flex gap-3 items-center">

                  <img src={p.image} className="w-14 h-14 rounded-lg object-cover"/>

                  <div className="flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-green-400 text-sm">¥{p.price}</p>
                    <p className="text-xs text-gray-400">{p.category}</p>
                  </div>

                  <button
                    onClick={()=>setEditProduct(p)}
                    className="bg-blue-600 px-3 py-1 rounded text-xs"
                  >
                    Edit
                  </button>

                </div>
              ))}
          </div>

        </div>
      )}

      {/* ORDERS */}
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
                className="w-full mt-2 bg-gray-800 rounded p-1"
              >
                <option value="pending">🟡 Pending</option>
                <option value="delivered">🟢 Delivered</option>
              </select>

              <p className="text-green-400">¥{o.total}</p>

            </div>
          ))}

        </div>
      )}

      {/* EDIT MODAL */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

          <div className="bg-gray-900 p-4 rounded-xl w-80 space-y-2">

            <h2 className="font-bold">Edit Product</h2>

            <input value={editProduct.name}
              onChange={(e)=>setEditProduct({...editProduct,name:e.target.value})}
              className="w-full p-2 bg-gray-800 rounded"/>

            <input value={editProduct.price}
              onChange={(e)=>setEditProduct({...editProduct,price:e.target.value})}
              className="w-full p-2 bg-gray-800 rounded"/>

            <input value={editProduct.stock}
              onChange={(e)=>setEditProduct({...editProduct,stock:e.target.value})}
              className="w-full p-2 bg-gray-800 rounded"/>

            <select
              value={editProduct.category}
              onChange={(e)=>setEditProduct({...editProduct,category:e.target.value})}
              className="w-full p-2 bg-gray-800 rounded"
            >
              {categories.map(c=><option key={c}>{c}</option>)}
            </select>

            <button
              onClick={async()=>{
                await supabase.from("products").update(editProduct).eq("id",editProduct.id);
                setMessage("Updated ✅");
                setEditProduct(null);
                fetchProducts();
              }}
              className="bg-green-600 w-full py-2 rounded"
            >
              Save
            </button>

            <button
              onClick={()=>setEditProduct(null)}
              className="bg-red-600 w-full py-2 rounded"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 flex justify-around py-3 border-t border-gray-800 text-sm">

        <button onClick={()=>setTab("dashboard")}
          className={tab==="dashboard"?"text-green-400":"text-gray-400"}>
          📊<br/>Home
        </button>

        <button onClick={()=>setTab("products")}
          className={tab==="products"?"text-green-400":"text-gray-400"}>
          📦<br/>Products
        </button>

        <button onClick={()=>setTab("orders")}
          className={tab==="orders"?"text-green-400":"text-gray-400"}>
          🧾<br/>Orders
        </button>

      </div>

    </main>
  );
}