import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Delivery from '@/models/delivery';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getMyDeliveries(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const deliveries = await Delivery.find({
      logisticsOfficerId: user.userId,
      status: { $ne: 'delivered' }
    })
    .populate({
      path: 'orderId',
      populate: {
        path: 'customerId',
        select: 'name email'
      }
    })
    .sort({ estimatedDeliveryDate: 1 });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Get my deliveries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getMyDeliveries, ['logistics']);