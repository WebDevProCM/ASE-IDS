import mongoose from 'mongoose';

export type TransferStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface ITransfer {
  transferNumber: string;
  fromRDC: mongoose.Types.ObjectId;
  toRDC: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  status: TransferStatus;
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  requestDate: Date;
  completionDate?: Date;
  notes?: string;
  rejectionReason?: string;
}

const transferSchema = new mongoose.Schema<ITransfer>({
  transferNumber: { type: String, required: true, unique: true },
  fromRDC: { type: mongoose.Schema.Types.ObjectId, ref: 'RDC', required: true },
  toRDC: { type: mongoose.Schema.Types.ObjectId, ref: 'RDC', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestDate: { type: Date, default: Date.now },
  completionDate: { type: Date },
  notes: { type: String },
  rejectionReason: { type: String },
}, { timestamps: true });

export default mongoose.models.Transfer || mongoose.model<ITransfer>('Transfer', transferSchema);