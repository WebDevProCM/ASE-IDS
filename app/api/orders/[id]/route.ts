import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order';
import '@/models/product';
import '@/models/user';
import { withAuth } from '@/lib/middleware';
import type { TokenPayload } from '@/lib/middleware';

async function getOrder(
  req: NextRequest,
  user: TokenPayload
) {
  try {
    await dbConnect();

    const id = req.nextUrl.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Order ID missing' }, { status: 400 });
    }

    const order = await Order.findById(id)
      .populate('items.productId')
      .populate('customerId', 'name email')
      .populate('items.rdcId', 'name location');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (
      user.role === 'customer' &&
      order.customerId._id.toString() !== user.userId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getOrder, [
  'customer',
  'admin',
  'rdc_staff',
  'ho_manager',
]);
