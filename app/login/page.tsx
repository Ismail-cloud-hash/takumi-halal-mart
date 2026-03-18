"use client";

import { useState } from "react";
import { supabase } from "../../supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin() {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login failed");
      return;
    }

    alert("Login success ✅");
    router.push("/admin");
  }

  return (
    <main className="p-10 max-w-md mx-auto">

      <h1 className="text-3xl mb-6 font-bold">
        Admin Login
      </h1>

      <input
        placeholder="Email"
        className="w-full p-3 mb-3 bg-gray-800 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 mb-3 bg-gray-800 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="w-full bg-green-600 py-3 rounded"
      >
        Login
      </button>

    </main>
  );
}