import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Inventory from '@/models/inventory';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateInventory(req: NextRequest, user: any, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const { quantity, minStockLevel, maxStockLevel } = await req.json();

    const inventory = await Inventory.findByIdAndUpdate(
      params.id,
      {
        quantity,
        minStockLevel,
        maxStockLevel,
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!inventory) {
      return NextResponse.json(
        { error: 'Inventory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Inventory updated successfully',
      inventory,
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PATCH = (req: NextRequest, { params }: { params: { id: string } }) => 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAuth((req: NextRequest, user: any) => updateInventory(req, user, { params }), ['admin']);