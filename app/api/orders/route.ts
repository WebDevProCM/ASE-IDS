import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order';
import Inventory from '@/models/inventory';
import Product from '@/models/product';
import { withAuth } from '@/lib/middleware';
import mongoose from 'mongoose';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createOrder(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { items, deliveryAddress, totalAmount, paymentStatus } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in order' },
        { status: 400 }
      );
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const orderItems: Record<string, string|number|Date>[] = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found` },
          { status: 400 }
        );
      }

      let inventory;

      console.log("userOrder: ", user);
      inventory = await Inventory.findOne({
        rdcId: user.rdcId,
        productId: item.productId,
        quantity: { $gte: item.quantity }
      }).populate('rdcId');


      if (!inventory) {
        console.log("false inventory");
        inventory = await Inventory.findOne({
          productId: item.productId,
          quantity: { $gte: item.quantity }
        }).populate('rdcId');
      }

      if (!inventory) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      orderItems.push({
        productId: item.productId,
        rdcId: inventory.rdcId,
        quantity: item.quantity,
        price: item.price,
        status: 'pending',
      });

      inventory.quantity -= item.quantity;
      await inventory.save();
    }

    const order = await Order.create({
      orderNumber,
      invoiceNumber,
      customerId: user.userId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      orderStatus: 'pending',
      paymentStatus: paymentStatus || 'pending',
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