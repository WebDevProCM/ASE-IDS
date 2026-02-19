import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order';
import '@/models/user';
import '@/models/product';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getMyOrders(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const orders = await Order.find({ customerId: user.userId })
      .populate('items.productId')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getMyOrders, ['customer']);