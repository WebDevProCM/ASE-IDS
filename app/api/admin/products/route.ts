import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
import { withAuth } from '@/lib/middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getProducts(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const products = await Product.find({}).sort({ category: 1, name: 1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createProduct(req: NextRequest, user: any) {
  try {
    await dbConnect();
    
    const { name, description, price, category, unit, image } = await req.json();

    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      unit,
      image,
      isActive: true,
    });

    return NextResponse.json({
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getProducts, ['admin']);
export const POST = withAuth(createProduct, ['admin']);