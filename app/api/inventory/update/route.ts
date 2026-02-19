import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Inventory from '@/models/inventory';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateInventory(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { productId, quantity } = await req.json();

    if (!user.rdcId) {
      return NextResponse.json(
        { error: 'No RDC assigned' },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity cannot be negative' },
        { status: 400 }
      );
    }

    const inventory = await Inventory.findOne({
      productId,
      rdcId: user.rdcId,
    });

    if (!inventory) {
      return NextResponse.json(
        { error: 'Inventory record not found' },
        { status: 404 }
      );
    }

    inventory.quantity = quantity;
    inventory.lastUpdated = new Date();
    await inventory.save();

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

export const POST = withAuth(updateInventory, ['rdc_staff']);