import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import RDC from '@/models/rdc';

export async function GET() {
  try {
    await dbConnect();
    
    const warehouses = await RDC.find({ isActive: true })
      .select('name location region')
      .sort({ name: 1 });

    return NextResponse.json(warehouses);
  } catch (error) {
    console.error('Fetch warehouses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}