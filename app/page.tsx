"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Admin() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Fruits");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    checkUser();

    // 🔥 REALTIME
    const channel = supabase
      .channel("live-products")
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
    if (!file || !name || !price || !stock) {
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
        stock: Number(stock), // 🔥 STOCK
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

  async function deleteProduct(id: number) {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <p className="p-6 text-white">Loading...</p>;

  // 🔥 DASHBOARD DATA
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((t, o) => t + o.total, 0);

  return (
    <main className="bg-black text-white min-h-screen p-4 md:p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl text-green-400 font-bold">
          Admin Dashboard
        </h1>

        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {/* 🔥 STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">

        <div className="bg-gray-900 p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Products</p>
          <h2 className="text-xl font-bold">{totalProducts}</h2>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Orders</p>
          <h2 className="text-xl font-bold">{totalOrders}</h2>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl col-span-2 md:col-span-1">
          <p className="text-gray-400 text-sm">Revenue</p>
          <h2 className="text-xl font-bold text-green-400">
            ¥{totalRevenue}
          </h2>
        </div>

      </div>

      {/* 🔥 ADD PRODUCT */}
      <div className="bg-gray-900 p-4 rounded-xl mb-8">

        <h2 className="mb-3 font-bold">Add Product</h2>

        <input placeholder="Name" className="w-full p-2 mb-2 bg-gray-800" onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Price" type="number" className="w-full p-2 mb-2 bg-gray-800" onChange={(e)=>setPrice(e.target.value)} />

        {/* 🔥 STOCK */}
        <input
          placeholder="Stock"
          type="number"
          className="w-full p-2 mb-2 bg-gray-800"
          onChange={(e)=>setStock(e.target.value)}
        />

        <input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} />

        <button onClick={addProduct} className="mt-3 w-full bg-green-600 py-2">
          Add Product
        </button>

      </div>

      {/* 🔥 PRODUCTS LIST */}
      <h2 className="mb-4 font-bold">Products</h2>

      <div className="space-y-3">

        {products.map(p => (
          <div key={p.id} className="bg-gray-900 p-3 rounded flex justify-between items-center">

            <div>
              <p>{p.name}</p>
              <p className="text-green-400">¥{p.price}</p>

              {/* 🔥 STOCK STATUS */}
              <p className={`text-xs ${p.stock < 5 ? "text-red-400" : "text-gray-400"}`}>
                Stock: {p.stock}
              </p>
            </div>

            <div className="flex gap-2">
              <Link href={`/admin/edit/${p.id}`} className="bg-blue-600 px-2 py-1 rounded text-sm">
                Edit
              </Link>

              <button onClick={()=>deleteProduct(p.id)} className="bg-red-600 px-2 py-1 rounded text-sm">
                Delete
              </button>
            </div>

          </div>
        ))}

      </div>

      {/* 🔥 ORDERS */}
      <h2 className="mt-8 mb-4 font-bold">Orders</h2>

      {orders.map(o => (
        <div key={o.id} className="bg-gray-900 p-3 mb-2 rounded">

          <p>{o.name}</p>

          {o.items?.map((i:any,index:number)=>(
            <p key={index} className="text-xs text-gray-400">
              {i.name} x {i.quantity}
            </p>
          ))}

          <p className="text-green-400">¥{o.total}</p>

        </div>
      ))}

    </main>
  );
}