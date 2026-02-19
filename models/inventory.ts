import mongoose from 'mongoose';

export interface IInventory {
  productId: mongoose.Types.ObjectId;
  rdcId: mongoose.Types.ObjectId;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  lastUpdated: Date;
}

const inventorySchema = new mongoose.Schema<IInventory>({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rdcId: { type: mongoose.Schema.Types.ObjectId, ref: 'RDC', required: true },
  quantity: { type: Number, required: true, min: 0 },
  minStockLevel: { type: Number, required: true, default: 10 },
  maxStockLevel: { type: Number, required: true, default: 100 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

inventorySchema.index({ productId: 1, rdcId: 1 }, { unique: true });

export default mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', inventorySchema);