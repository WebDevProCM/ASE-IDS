import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Inventory from '@/models/inventory';
import { withAuth } from '@/lib/middleware';

async function updateInventory(
  req: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any,
  params: { id: string }
) {
  try {
    await dbConnect();

    const body = await req.json();
    const { quantity, minStockLevel, maxStockLevel } = body;

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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params; 

  return withAuth(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req: NextRequest, user: any) =>
      updateInventory(req, user, params),
    ['admin']
  )(req);
}