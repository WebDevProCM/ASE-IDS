import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user';
import { withAuth } from '@/lib/middleware';
import bcrypt from 'bcryptjs';

async function getUsers(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam !== null ? parseInt(limitParam) : undefined;

    let usersQuery = User.find({})
      .populate({
        path: 'rdcId',
        select: 'name location',
        strictPopulate: false,
      })
      .populate({
        path: 'preferredWarehouse',
        select: 'name location',
        strictPopulate: false,
      })
      .select('-password')
      .sort({ createdAt: -1 });

    if (limit !== undefined && !isNaN(limit)) {
      usersQuery = usersQuery.limit(limit);
    }

    const users = await usersQuery.exec();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createUser(req: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password, role, rdcId, preferredWarehouse } =
      await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true,
    };

    if (role === 'customer' && preferredWarehouse) {
      userData.preferredWarehouse = preferredWarehouse;
    }

    if ((role === 'rdc_staff' || role === 'logistics') && rdcId) {
      userData.rdcId = rdcId;
    }

    const newUser = await User.create(userData);

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getUsers, ['admin']);
export const POST = withAuth(createUser, ['admin']);
