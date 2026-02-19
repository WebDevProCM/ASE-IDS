import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAdminOrders(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const status = searchParams.get('status');

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    // Get orders
    let ordersQuery = Order.find(query)
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    if (limit) {
      ordersQuery = ordersQuery.limit(limit);
    }

    const orders = await ordersQuery;

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get admin orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getAdminOrders, ['admin']);