import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
import Inventory from '@/models/inventory';

export async function GET() {
  try {
    await dbConnect();
    
    const products = await Product.find({ isActive: true });
    
    // Get stock levels for each product
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const inventory = await Inventory.aggregate([
          { $match: { productId: product._id } },
          { $group: { _id: null, total: { $sum: '$quantity' } } },
        ]);
        
        return {
          ...product.toObject(),
          stockLevel: inventory[0]?.total || 0,
        };
      })
    );
    
    return NextResponse.json(productsWithStock);
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}