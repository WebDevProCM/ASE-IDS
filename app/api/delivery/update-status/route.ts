import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Delivery from '@/models/delivery';
import Order from '@/models/order';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateDeliveryStatus(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { deliveryId, status, location } = await req.json();

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    // Add tracking update
    delivery.trackingUpdates.push({
      status,
      location,
      timestamp: new Date()
    });

    delivery.status = status;

    if (status === 'delivered') {
      delivery.actualDeliveryDate = new Date();
      
      // Update order status
      await Order.findByIdAndUpdate(delivery.orderId, {
        orderStatus: 'delivered'
      });
    }

    await delivery.save();

    return NextResponse.json({
      message: 'Delivery status updated successfully',
      delivery
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PATCH = withAuth(updateDeliveryStatus, ['logistics']);