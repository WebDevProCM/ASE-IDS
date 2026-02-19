import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateOrderStatus(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { orderItemId, status } = await req.json();

    // Find the order containing this item
    const order = await Order.findOne({ 'items._id': orderItemId });

    if (!order) {
      return NextResponse.json(
        { error: 'Order item not found' },
        { status: 404 }
      );
    }

    // Update the specific item's status
    const item = order.items.id(orderItemId);
    
    // Check if user has permission (RDC staff can only update their own RDC's items)
    if (user.role === 'rdc_staff' && item.rdcId.toString() !== user.rdcId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    item.status = status;
    
    // Check if all items are delivered to update order status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allItemsDelivered = order.items.every((i: any) => i.status === 'delivered');
    if (allItemsDelivered) {
      order.orderStatus = 'delivered';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if (order.items.some((i: any) => i.status === 'dispatched')) {
      order.orderStatus = 'dispatched';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if (order.items.some((i: any) => i.status === 'processing')) {
      order.orderStatus = 'processing';
    }

    await order.save();

    return NextResponse.json({
      message: 'Order status updated successfully',
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PATCH = withAuth(updateOrderStatus, ['rdc_staff', 'logistics']);