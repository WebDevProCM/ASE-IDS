import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order';
import Inventory from '@/models/inventory';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cancelOrderItem(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { orderItemId, reason } = await req.json();

    if (!reason) {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ 'items._id': orderItemId });

    if (!order) {
      return NextResponse.json(
        { error: 'Order item not found' },
        { status: 404 }
      );
    }

    const item = order.items.id(orderItemId);
    
    if (user.role === 'rdc_staff' && item.rdcId.toString() !== (user.rdcId as Record<string, string>)?._id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (item.status === 'delivered' || item.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot cancel delivered or already cancelled items' },
        { status: 400 }
      );
    }

    const inventory = await Inventory.findOne({
      productId: item.productId,
      rdcId: item.rdcId,
    });

    if (inventory) {
      inventory.quantity += item.quantity;
      await inventory.save();
    }

    item.status = 'cancelled';
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allItemsCancelled = order.items.every((i: any) => i.status === 'cancelled');
    if (allItemsCancelled) {
      order.orderStatus = 'cancelled';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if (order.items.some((i: any) => i.status === 'delivered')) {
      order.orderStatus = 'delivered';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if (order.items.some((i: any) => i.status === 'dispatched')) {
      order.orderStatus = 'dispatched';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if (order.items.some((i: any) => i.status === 'processing')) {
      order.orderStatus = 'processing';
    } else {
      order.orderStatus = 'pending';
    }

    await order.save();

    return NextResponse.json({
      message: 'Order item cancelled successfully',
      item: item,
      stockRestored: true,
    });
  } catch (error) {
    console.error('Cancel order item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(cancelOrderItem, ['rdc_staff', 'admin']);