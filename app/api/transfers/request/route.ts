import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transfer from '@/models/transfers';
import Inventory from '@/models/inventory';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requestTransfer(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { toRDC, items, notes } = await req.json();

    if (!toRDC || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Destination RDC and items are required' },
        { status: 400 }
      );
    }

    if (!user.rdcId) {
      return NextResponse.json(
        { error: 'No source RDC assigned' },
        { status: 400 }
      );
    }

    for (const item of items) {
      const inventory = await Inventory.findOne({
        productId: item.productId,
        rdcId: user.rdcId,
      });

      if (!inventory || inventory.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product` },
          { status: 400 }
        );
      }
    }

    const transferNumber = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transfer = await Transfer.create({
      transferNumber,
      fromRDC: user.rdcId,
      toRDC,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      status: 'pending',
      requestedBy: user.userId,
      notes,
    });

    return NextResponse.json({
      message: 'Transfer request created successfully',
      transfer,
    });
  } catch (error) {
    console.error('Request transfer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(requestTransfer, ['rdc_staff', 'admin']);