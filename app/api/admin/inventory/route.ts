import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Inventory from '@/models/inventory';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getInventory(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const inventory = await Inventory.find({})
      .populate('productId', 'name price unit')
      .populate('rdcId', 'name location')
      .sort({ 'rdcId.name': 1, 'productId.name': 1 });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Get inventory error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createInventory(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { rdcId, productId, quantity, minStockLevel, maxStockLevel } = await req.json();

    const existingInventory = await Inventory.findOne({
      rdcId,
      productId,
    });

    if (existingInventory) {
      return NextResponse.json(
        { error: 'Inventory already exists for this product in this RDC' },
        { status: 400 }
      );
    }

    const inventory = await Inventory.create({
      rdcId,
      productId,
      quantity: parseInt(quantity),
      minStockLevel: parseInt(minStockLevel),
      maxStockLevel: parseInt(maxStockLevel),
    });

    return NextResponse.json({
      message: 'Inventory created successfully',
      inventory,
    });
  } catch (error) {
    console.error('Create inventory error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getInventory, ['admin']);
export const POST = withAuth(createInventory, ['admin']);