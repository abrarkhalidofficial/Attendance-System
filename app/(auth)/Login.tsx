"use client";

import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";
import { login } from "@/actions";
import usePostAction from "@/hooks/usePostAction";

export default function Login() {
  const router = useRouter();

  const { action, isPending, data } = usePostAction({
    action: login,
    defaultState: { error: "" },
    onError: (data) => alert(data.error),
    onSuccess: () => {
      router.refresh();

    },
  });

  return (
    <form
      action={action}
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "50px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
          textAlign: "center",
          color: "#333",
        }}
      >
        Login
      </div>
      <input
        name="email"
        type="text"
        placeholder="Email"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "10px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "16px",
        }}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        style={{
          width: "100%", maxWidth: "480px",
          padding: "10px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "16px",
        }}
      />
      {data.error && (
        <p
          style={{
            color: "red",
            fontSize: "14px",
            marginBottom: "15px",
          }}
        >
          {data.error}
        </p>
      )}
      <button
        disabled={isPending}
        type="submit"
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: isPending ? "#ccc" : "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
          cursor: isPending ? "not-allowed" : "pointer",
          transition: "background-color 0.3s",
        }}
      >
        {isPending ? "Loading..." : "Login"}
      </button>
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <Link
          href={{ pathname: "/register", search: useSearchParams().toString() }}
          style={{
            color: "#007BFF",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          Register
        </Link>
      </div>
    </form>

  );
}
