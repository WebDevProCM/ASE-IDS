import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import RDC from '@/models/rdc';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getRDCs(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const rdcs = await RDC.find({}).sort({ name: 1 });
    return NextResponse.json(rdcs);
  } catch (error) {
    console.error('Get RDCs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createRDC(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { name, location, region, address, contactNumber, managerName, managerContact } = await req.json();

    const existingRDC = await RDC.findOne({ name });
    if (existingRDC) {
      return NextResponse.json(
        { error: 'RDC with this name already exists' },
        { status: 400 }
      );
    }

    const newRDC = await RDC.create({
      name,
      location,
      region,
      address,
      contactNumber,
      managerName,
      managerContact,
      isActive: true,
    });

    return NextResponse.json({
      message: 'RDC created successfully',
      rdc: newRDC,
    });
  } catch (error) {
    console.error('Create RDC error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getRDCs, ['admin']);
export const POST = withAuth(createRDC, ['admin']);