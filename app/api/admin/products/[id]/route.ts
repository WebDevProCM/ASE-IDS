import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
import { withAuth } from '@/lib/middleware';
import mongoose from 'mongoose';
import type { TokenPayload } from '@/lib/middleware';

async function updateProduct(
  req: NextRequest,
  user: TokenPayload
) {
  try {
    await dbConnect();

    const id = req.nextUrl.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updates: Record<string, unknown> = {};

    if (typeof body.name === 'string') updates.name = body.name;
    if (typeof body.description === 'string') updates.description = body.description;
    if (typeof body.price === 'number') updates.price = body.price;
    if (typeof body.category === 'string') updates.category = body.category;
    if (typeof body.unit === 'string') updates.category = body.unit;
    if (typeof body.isActive === 'boolean') updates.isActive = body.isActive;
    if (typeof body.image === 'string') updates.image = body.image;

    console.log("updates.imageUrl: ", updates.image);
    console.log("body.image: ", body.image);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(updateProduct, ['admin']);
export const PATCH = withAuth(updateProduct, ['admin']);
