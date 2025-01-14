"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setPassword } from "@/actions"; // Import the setPassword function
import { toast } from "react-toastify";

export default function Register() {
  const [password, setPasswordState] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);

      // Call setPassword from actions instead of fetch
      const token = new URLSearchParams(window.location.search).get("token"); // Extract token from URL query string
      if (!token) {
        setError("Token is missing");
        return;
      }

      const result = await setPassword({ token, password, confirmPassword });

      // Handle success and navigate to login page
      toast.success(result.message);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 500,
        margin: "50px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>Set Your Password</h1>
      {error && (
        <p
          style={{
            color: "red",
            marginBottom: 15,
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPasswordState(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 15,
          border: "1px solid #ccc",
          borderRadius: 4,
        }}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 15,
          border: "1px solid #ccc",
          borderRadius: 4,
        }}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: "100%",
          padding: 10,
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}
      >
        {isSubmitting ? "Submitting..." : "Set Password"}
      </button>
    </form>
  );
}
