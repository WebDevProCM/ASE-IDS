import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getRdcPendingOrders(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    if (!user.rdcId) {
      return NextResponse.json(
        { error: 'No RDC assigned' },
        { status: 400 }
      );
    }

    const orders = await Order.find({
      'items.rdcId': user.rdcId._id,
    })
    .populate('customerId', 'name')
    .populate('items.productId', 'name unit')
    .sort({ createdAt: -1 });

    const rdcItems = orders.flatMap(order => 
      order.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((item: any) => item.rdcId.toString() === user.rdcId._id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => ({
          ...item.toObject(),
          orderNumber: order.orderNumber,
          customerId: order.customerId,
          deliveryAddress: order.deliveryAddress,
          createdAt: order.createdAt,
        }))
    );

    return NextResponse.json(rdcItems);
  } catch (error) {
    console.error('Fetch RDC orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getRdcPendingOrders, ['rdc_staff']);