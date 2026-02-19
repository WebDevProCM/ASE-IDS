import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
import Inventory from '@/models/inventory';
import RDC from '@/models/rdc';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getInventoryReport(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    // Get total products
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Get total inventory value
    const inventoryValue = await Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$quantity', '$product.price'] } }
        }
      }
    ]);

    // Get low stock items
    const lowStockItems = await Inventory.aggregate([
      {
        $match: {
          $expr: { $lte: ['$quantity', '$minStockLevel'] }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'rdcs',
          localField: 'rdcId',
          foreignField: '_id',
          as: 'rdc'
        }
      },
      { $unwind: '$rdc' },
      {
        $project: {
          productName: '$product.name',
          rdcName: '$rdc.name',
          quantity: 1,
          minStockLevel: 1
        }
      }
    ]);

    // Get stock by RDC
    const stockByRDC = await Inventory.aggregate([
      {
        $lookup: {
          from: 'rdcs',
          localField: 'rdcId',
          foreignField: '_id',
          as: 'rdc'
        }
      },
      { $unwind: '$rdc' },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$rdc.name',
          itemCount: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$product.price'] } }
        }
      },
      {
        $project: {
          rdcName: '$_id',
          itemCount: 1,
          totalValue: 1,
          _id: 0
        }
      }
    ]);

    return NextResponse.json({
      totalProducts,
      totalValue: inventoryValue[0]?.totalValue || 0,
      lowStockItems,
      stockByRDC
    });
  } catch (error) {
    console.error('Inventory report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getInventoryReport, ['ho_manager', 'admin']);