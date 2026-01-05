import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo - use database in production
let adminUsers: { id: string; username: string; email: string; role: string; password: string; createdAt: string }[] = [];

export async function GET(request: NextRequest) {
  try {
    // Return users without password
    const safeUsers = adminUsers.map(({ password, ...user }) => user);
    return NextResponse.json({ success: true, data: safeUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, role } = await request.json();

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if username already exists
    if (adminUsers.some(u => u.username === username)) {
      return NextResponse.json(
        { success: false, message: "Username already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      password, // In production, hash this password
      role: role || "admin",
      createdAt: new Date().toISOString(),
    };

    adminUsers.push(newUser);

    // Return user without password
    const { password: _, ...safeUser } = newUser;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 }
    );
  }
}
