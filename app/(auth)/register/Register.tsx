"use client";

import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";
import { register } from "@/actions";
import usePostAction from "@/hooks/usePostAction";

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");

  const { action, isPending, data } = usePostAction({
    action: register,
    defaultState: { error: "" },
    onError: (data) => alert(data.error),
    onSuccess: () => {
      if (invite) {
        router.replace("/?invite=" + invite);
      } else {
        router.replace("/");
      }
    },
    
  });

  return (
    <form
      style={{
        maxWidth: 500,
        margin: "50px auto",
        padding: 50,
        border: "1px solid #ddd",
        borderRadius: 8,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
      }}
      action={action}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
          color: "#333",
        }}
      >
        Register
      </div>
      <input
      
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 10,
          marginBottom: 15,
          border: "1px solid #ccc",
        }}
      
      
      name="email" type="text" placeholder="Email" />
      <input
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 10,
          marginBottom: 15,
          border: "1px solid #ccc",
        }}
      
      name="password" type="password" placeholder="Password" />
      <input

        style={{
          width: "100%",
          maxWidth: 480,
          padding: 10,
          marginBottom: 15,
          border: "1px solid #ccc",
        }}

        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
      />
      {data.error && <p
        style={{
          color: "red",
          fontSize: 14,
          marginBottom: 15,
        }}
      
      >{data.error}</p>}
      <button
        style={{
          width: "100%",
          padding: 10,
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      
      disabled={isPending} type="submit">
        {isPending ? "Loading..." : "Register"}
      </button>
      <Link 
        style={{
          display: "block",
          textAlign: "center",
          marginTop: 20,
          color: "#333",
          textDecoration: "none",
        }}
      
      href={invite ? `/?invite=${invite}` : "/"}>Login</Link>
    </form>
  );
}
