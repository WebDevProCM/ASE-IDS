import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUsers(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    let usersQuery = User.find({})
      .populate('rdcId', 'name location')
      .select('-password')
      .sort({ createdAt: -1 });

    if (limit) {
      usersQuery = usersQuery.limit(limit);
    }

    const users = await usersQuery;
    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createUser(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { name, email, password, role, rdcId } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      rdcId: rdcId || null,
      isActive: true,
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getUsers, ['admin']);
export const POST = withAuth(createUser, ['admin']);