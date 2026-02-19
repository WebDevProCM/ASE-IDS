import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order';
import Delivery from '@/models/delivery';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPendingDeliveries(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    // Find orders that are ready for delivery but not yet assigned
    const orders = await Order.find({
      orderStatus: { $in: ['processing', 'dispatched'] },
      _id: { $nin: await Delivery.distinct('orderId') }
    })
    .populate('customerId', 'name email')
    .populate('items.productId', 'name')
    .sort({ createdAt: 1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get pending deliveries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getPendingDeliveries, ['logistics', 'admin']);