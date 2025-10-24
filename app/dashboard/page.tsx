"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
  }, [router]);
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };
  
  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.name || user.email}</CardTitle>
            <CardDescription>Employee Portal</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You are logged in as an employee.</p>
            <p className="mt-2">Your role: {user.role}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
            <CardDescription>Track your attendance</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button className="flex-1">Clock In</Button>
            <Button className="flex-1" variant="outline">Clock Out</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}