"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login(){

  const [password,setPassword] = useState("");
  const router = useRouter();

  function login(){

    if(password === "admin123"){
      localStorage.setItem("admin","true");
      router.push("/admin");
    } else {
      alert("Wrong password ❌");
    }

  }

  return(
    <main className="flex justify-center items-center h-screen bg-white">

      <div className="p-6 border rounded w-80">

        <h1 className="text-xl font-bold mb-4 text-green-700">
          Admin Login
        </h1>

        <input
          type="password"
          placeholder="Enter password"
          className="border p-2 mb-3 w-full"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          Login
        </button>

      </div>

    </main>
  );
}