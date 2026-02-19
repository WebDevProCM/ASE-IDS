import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import RDC from '@/models/rdc';
import { withAuth } from '@/lib/middleware';
import mongoose from 'mongoose';
import type { TokenPayload } from '@/lib/middleware';

async function updateRDC(
  req: NextRequest,
  user: TokenPayload
) {
  try {
    await dbConnect();

    const id = req.nextUrl.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid RDC ID' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updates: Record<string, unknown> = {};

    if (typeof body.name === 'string') updates.name = body.name;
    if (typeof body.location === 'string') updates.location = body.location;
    if (typeof body.region === 'string') updates.region = body.region;
    if (typeof body.address === 'string') updates.address = body.address;
    if (typeof body.contactNumber === 'string') updates.contactNumber = body.contactNumber;
    if (typeof body.isActive === 'boolean') updates.isActive = body.isActive;

    const updatedRDC = await RDC.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedRDC) {
      return NextResponse.json(
        { error: 'RDC not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'RDC updated successfully',
      rdc: updatedRDC,
    });
  } catch (error) {
    console.error('Update RDC error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(updateRDC, ['admin']);
export const PATCH = withAuth(updateRDC, ['admin']);
