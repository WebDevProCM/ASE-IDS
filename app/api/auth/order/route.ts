import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order';
import '@/models/rdc';
import Inventory from '@/models/inventory';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createOrder(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { items, deliveryAddress, totalAmount } = await req.json();

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Check stock availability and assign to RDCs
    const orderItems: Record<string,string|number|Date>[] = [];
    
for (const item of items) {
  const inventory = await Inventory.findOne({
    productId: item.productId,
    quantity: { $gte: item.quantity }
  });

  if (!inventory) {
    return NextResponse.json(
      { error: `Insufficient stock for product ${item.productId}` },
      { status: 400 }
    );
  }

  orderItems.push({
    productId: item.productId,
    rdcId: inventory.rdcId, // ✅ ObjectId only
    quantity: item.quantity,
    price: item.price,
    status: 'pending',
  });

  inventory.quantity -= item.quantity;
  await inventory.save();
}
    // Create order
    const order = await Order.create({
      orderNumber,
      customerId: user.userId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      orderStatus: 'pending',
      paymentStatus: 'pending',
    });

    return NextResponse.json({
      message: 'Order created successfully',
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(createOrder, ['customer']);