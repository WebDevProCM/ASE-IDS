import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSalesReport(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchStage: any = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate + 'T23:59:59');
    }

    // Get overall sales
    const sales = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);
    
    // Get sales by RDC
    const salesByRDC = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'rdcs',
          localField: 'items.rdcId',
          foreignField: '_id',
          as: 'rdc',
        },
      },
      { $unwind: '$rdc' },
      {
        $group: {
          _id: '$rdc.name',
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          rdcName: '$_id',
          totalSales: 1,
          orderCount: 1,
          _id: 0,
        },
      },
      { $sort: { totalSales: -1 } }
    ]);
    
    // Get top products
    const topProducts = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.name',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          productName: '$_id',
          quantity: 1,
          revenue: 1,
          _id: 0,
        },
      },
    ]);

    // Get daily sales for chart
    const dailySales = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    return NextResponse.json({
      totalSales: sales[0]?.totalSales || 0,
      totalOrders: sales[0]?.totalOrders || 0,
      averageOrderValue: sales[0]?.averageOrderValue || 0,
      salesByRDC,
      topProducts,
      dailySales
    });
  } catch (error) {
    console.error('Sales report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getSalesReport, ['ho_manager', 'admin']);