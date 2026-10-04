import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRole = ['CITIZEN', 'OFFICER', 'WORKER', 'SUPERVISOR', 'ADMIN'].includes(role)
      ? role
      : 'CITIZEN';

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newUser = await UserModel.create({
      id: userId,
      name,
      email: cleanEmail,
      passwordHash,
      role: userRole,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Account created in MongoDB.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user account' },
      { status: 500 }
    );
  }
}
