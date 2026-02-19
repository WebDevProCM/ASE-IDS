import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order';
import '@/models/user';
import '@/models/product';
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

    // Find all order items for this RDC that are pending or processing
    const orders = await Order.find({
      'items.rdcId': user.rdcId,
      'items.status': { $in: ['pending', 'processing'] }
    })
    .populate('customerId', 'name')
    .populate('items.productId', 'name unit')
    .sort({ createdAt: -1 });

    // Extract only the items belonging to this RDC
    const rdcItems = orders.flatMap(order => 
      order.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((item: any) => 
          item.rdcId.toString() === user.rdcId && 
          ['pending', 'processing'].includes(item.status)
        )
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