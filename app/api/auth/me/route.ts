import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/middleware';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user';
import '@/models/rdc';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();
    
    const user = await User.findById(payload.userId).populate('rdcId').populate('preferredWarehouse');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rdcId: user?.preferredWarehouse === null ? user.rdcId :  user?.preferredWarehouse,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}