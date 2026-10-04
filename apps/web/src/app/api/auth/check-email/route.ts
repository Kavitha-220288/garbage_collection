import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      await connectToDatabase();
      const existingUser = await UserModel.findOne({ email: cleanEmail }).lean();

      if (existingUser) {
        return NextResponse.json({
          success: true,
          exists: true,
          user: {
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
          },
        });
      }
    } catch (dbErr: any) {
      console.warn('⚠️ MongoDB check-email fallback:', dbErr?.message || dbErr);
    }

    return NextResponse.json({
      success: true,
      exists: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error checking email' },
      { status: 500 }
    );
  }
}
