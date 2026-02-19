import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Delivery from '@/models/delivery';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDeliveryReport(req: NextRequest, user: any) {
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

    // Get delivery statistics
    const stats = await Delivery.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalDeliveries: { $sum: 1 },
          completedDeliveries: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          failedDeliveries: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          onTimeDeliveries: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'delivered'] },
                    { $lte: ['$actualDeliveryDate', '$estimatedDeliveryDate'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get deliveries by status
    const byStatus = await Delivery.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get average delivery time
    const avgTime = await Delivery.aggregate([
      {
        $match: {
          status: 'delivered',
          actualDeliveryDate: { $exists: true }
        }
      },
      {
        $project: {
          deliveryTime: {
            $divide: [
              { $subtract: ['$actualDeliveryDate', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageHours: { $avg: '$deliveryTime' }
        }
      }
    ]);

    return NextResponse.json({
      totalDeliveries: stats[0]?.totalDeliveries || 0,
      completedDeliveries: stats[0]?.completedDeliveries || 0,
      failedDeliveries: stats[0]?.failedDeliveries || 0,
      onTimeDeliveries: stats[0]?.onTimeDeliveries || 0,
      onTimeRate: stats[0]?.totalDeliveries 
        ? ((stats[0]?.onTimeDeliveries / stats[0]?.completedDeliveries) * 100).toFixed(1)
        : 0,
      byStatus,
      averageDeliveryTime: avgTime[0]?.averageHours?.toFixed(1) || 0
    });
  } catch (error) {
    console.error('Delivery report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getDeliveryReport, ['ho_manager', 'admin']);