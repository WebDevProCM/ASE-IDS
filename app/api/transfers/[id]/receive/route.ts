import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transfer from '@/models/transfers';
import Inventory from '@/models/inventory';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function receiveTransfer(req: NextRequest, user: any, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await dbConnect();
    
    const transfer = await Transfer.findById(id);

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    if (transfer.status === 'completed') {
      return NextResponse.json({ error: 'Transfer already completed' }, { status: 400 });
    }

    if (transfer.toRDC.toString() !== user.rdcId) {
      return NextResponse.json({ error: 'Only destination RDC can receive' }, { status: 403 });
    }

    if (transfer.status !== 'approved') {
      return NextResponse.json({ error: 'Transfer must be approved first' }, { status: 400 });
    }

    for (const item of transfer.items) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId, rdcId: user.rdcId },
        { 
          $inc: { quantity: item.quantity },
          $setOnInsert: { minStockLevel: 10, maxStockLevel: 100 } 
        },
        { upsert: true }
      );

      await Inventory.findOneAndUpdate(
        { productId: item.productId, rdcId: transfer.fromRDC },
        { $inc: { quantity: -item.quantity } }
      );
    }

    transfer.status = 'completed';
    transfer.completionDate = new Date();
    await transfer.save();

    return NextResponse.json({
      message: 'Transfer completed successfully',
      transfer,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Receive transfer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAuth((req: NextRequest, user: any) => receiveTransfer(req, user, { params }), ['rdc_staff', 'admin'])(req);