import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order';
import { withAuth } from '@/lib/middleware';
import mongoose from 'mongoose';
import type { TokenPayload } from '@/lib/middleware';

async function getOrderDetails(
  req: NextRequest,
  user: TokenPayload
) {
  try {
    await dbConnect();

    const id = req.nextUrl.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price unit')
      .populate('items.rdcId', 'name location');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Get order details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateOrder(
  req: NextRequest,
  user: TokenPayload
) {
  try {
    await dbConnect();

    const id = req.nextUrl.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // ✅ Only allow SAFE order updates
    const updates: Record<string, unknown> = {};

    if (typeof body.orderStatus === 'string') {
      updates.orderStatus = body.orderStatus;
    }

    if (typeof body.paymentStatus === 'string') {
      updates.paymentStatus = body.paymentStatus;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getOrderDetails, ['admin']);
export const PATCH = withAuth(updateOrder, ['admin']);
