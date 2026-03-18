"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";
import Link from "next/link";

export default function Admin() {

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  // PRODUCTS
  const [products, setProducts] = useState<any[]>([]);

  // ORDERS
  const [orders, setOrders] = useState<any[]>([]);

  // FORM
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // 🔐 CHECK LOGIN
  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.push("/login");
    } else {
      setLoading(false);
      fetchProducts();
      fetchOrders(); // 🔥 NEW
    }
  }

  // 📦 FETCH PRODUCTS
  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    setProducts(data || []);
  }

  // 📦 FETCH ORDERS
  async function fetchOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    setOrders(data || []);
  }

  // ➕ ADD PRODUCT
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
      alert("Image upload failed");
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

  // ❌ DELETE PRODUCT
  async function deleteProduct(id: number) {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  }

  // 🚪 LOGOUT
  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // ⏳ LOADING
  if (loading) {
    return <p className="p-10">Checking access...</p>;
  }

  return (
    <main className="p-10">

      {/* HEADER */}
      <div className="flex justify-between mb-8">

        <h1 className="text-3xl text-green-500 font-bold">
          Admin Panel
        </h1>

        <div className="flex gap-3">
          <Link href="/" className="bg-gray-700 px-4 py-2 rounded">
            Home
          </Link>

          <button
            onClick={logout}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

      </div>

      {/* ADD PRODUCT */}
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

      {/* PRODUCTS */}
      <h2 className="text-2xl mt-10 mb-4">
        Products 🛍️
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

      {/* ORDERS */}
      <h2 className="text-2xl mt-10 mb-4">
        Orders 📦
      </h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-gray-900 p-4 mb-3 rounded"
        >
          <p><strong>Name:</strong> {order.name}</p>
          <p><strong>Phone:</strong> {order.phone}</p>
          <p><strong>Address:</strong> {order.address}</p>
          <p className="text-green-500">
            Total: ¥{order.total}
          </p>
        </div>
      ))}

    </main>
  );
}