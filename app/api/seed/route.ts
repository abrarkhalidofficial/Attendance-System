import { NextResponse } from "next/server";

// This is a simple API route to seed the admin user
// In a real application, you would use Convex's seeding mechanism
export async function GET() {
  try {
    // Simulate creating the admin user
    const adminUser = {
      email: "admin@gmail.com",
      password: "12345678", // In production, use proper password hashing
      name: "Admin User",
      role: "admin",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // In a real app, this would call the Convex mutation
    // For this demo, we'll just return the user
    
    return NextResponse.json({ 
      success: true, 
      message: "Admin user seeded successfully",
      user: adminUser
    });
  } catch (error) {
    console.error("Error seeding admin user:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to seed admin user" 
    }, { status: 500 });
  }
}