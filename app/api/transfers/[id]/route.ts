import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transfer from '@/models/transfers';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateTransfer(req: NextRequest, user: any, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    
    // 1. Await params (Required in newer Next.js versions)
    const { id } = await params;
    const { status, rejectionReason } = await req.json();

    const transfer = await Transfer.findById(id);

    if (!transfer) {
      return NextResponse.json(
        { error: 'Transfer not found' },
        { status: 404 }
      );
    }

    // 2. Logic for Approval/Rejection
    if (status === 'approved' || status === 'rejected') {
      if (transfer.toRDC.toString() !== user.rdcId) {
        return NextResponse.json(
          { error: 'Only destination RDC can approve/reject' },
          { status: 403 }
        );
      }
    }

    // 3. Logic for Cancellation
    if (status === 'cancelled') {
      if (transfer.fromRDC.toString() !== user.rdcId) {
        return NextResponse.json(
          { error: 'Only source RDC can cancel' },
          { status: 403 }
        );
      }
    }

    // 4. Update fields
    transfer.status = status;
    if (status === 'rejected' && rejectionReason) {
      transfer.rejectionReason = rejectionReason;
    }
    if (status === 'approved') {
      transfer.approvedBy = user.userId;
    }

    await transfer.save();

    return NextResponse.json({
      message: 'Transfer updated successfully',
      transfer,
    });
  } catch (error) {
    console.error('Update transfer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAuth((req: NextRequest, user: any) => updateTransfer(req, user, { params }), ['rdc_staff', 'admin'])(req);