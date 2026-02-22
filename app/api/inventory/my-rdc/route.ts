import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Inventory from '@/models/inventory';
import '@/models/product';
import { withAuth } from '@/lib/middleware';
import type { TokenPayload } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getMyRdcInventory(req: NextRequest, user: TokenPayload) {
  try {
    await dbConnect();
    
    if (!user.rdcId) {
      return NextResponse.json(
        { error: 'No RDC assigned' },
        { status: 400 }
      );
    }
    
    const inventory = await Inventory.find({ rdcId: (user.rdcId as Record<string, string>)?._id })
    .populate('productId');
    
  
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Fetch inventory error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getMyRdcInventory, ['rdc_staff']);
