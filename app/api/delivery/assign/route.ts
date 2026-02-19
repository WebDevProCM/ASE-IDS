import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Delivery from '@/models/delivery';
import Order from '@/models/order';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assignDelivery(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { orderId, vehicleNumber, driverName, driverContact, estimatedDeliveryDate } = await req.json();

    // Check if delivery already exists for this order
    const existingDelivery = await Delivery.findOne({ orderId });
    if (existingDelivery) {
      return NextResponse.json(
        { error: 'Delivery already assigned for this order' },
        { status: 400 }
      );
    }

    // Create delivery record
    const delivery = await Delivery.create({
      orderId,
      logisticsOfficerId: user.userId,
      vehicleNumber,
      driverName,
      driverContact,
      estimatedDeliveryDate: new Date(estimatedDeliveryDate),
      status: 'assigned',
      trackingUpdates: [{
        status: 'assigned',
        location: 'Warehouse',
        timestamp: new Date(),
        notes: 'Delivery assigned'
      }]
    });

    // Update order status
    await Order.findByIdAndUpdate(orderId, {
      orderStatus: 'dispatched'
    });

    return NextResponse.json({
      message: 'Delivery assigned successfully',
      delivery
    });
  } catch (error) {
    console.error('Assign delivery error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(assignDelivery, ['logistics']);