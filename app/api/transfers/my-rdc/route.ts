import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transfer from '@/models/transfers';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getMyRdcTransfers(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    if (!user.rdcId) {
      return NextResponse.json(
        { error: 'No RDC assigned' },
        { status: 400 }
      );
    }

    const transfers = await Transfer.find({
      $or: [
        { fromRDC: (user.rdcId as Record<string, string>)?._id },
        { toRDC: (user.rdcId as Record<string, string>)?._id }
      ]
    })
    .populate('fromRDC', 'name location')
    .populate('toRDC', 'name location')
    .populate('items.productId', 'name unit')
    .populate('requestedBy', 'name')
    .populate('approvedBy', 'name')
    .sort({ requestDate: -1 });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error('Get transfers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getMyRdcTransfers, ['rdc_staff', 'admin']);