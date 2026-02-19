import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user';
import { withAuth } from '@/lib/middleware';
import mongoose from 'mongoose';
import type { TokenPayload } from '@/lib/middleware';

async function updateUser(
  req: NextRequest,
  user: TokenPayload
) {
  try {
    await dbConnect();

    const id = req.nextUrl.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { isActive, role, rdcId } = await req.json();

    const updateData: Record<string, unknown> = {};

    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof role === 'string') updateData.role = role;

    if (rdcId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(rdcId)) {
        return NextResponse.json(
          { error: 'Invalid RDC ID' },
          { status: 400 }
        );
      }
      updateData.rdcId = rdcId;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PATCH = withAuth(updateUser, ['admin']);
