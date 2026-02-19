import mongoose from 'mongoose';

export interface IProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  unit: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
}

const productSchema = new mongoose.Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  image: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);