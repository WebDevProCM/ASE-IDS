import mongoose from 'mongoose';

export interface IRDC {
  name: string;
  location: string;
  region: string;
  address: string;
  contactNumber: string;
  isActive: boolean;
  managerName?: string;
  managerContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rdcSchema = new mongoose.Schema<IRDC>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  region: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  managerName: { type: String },
  managerContact: { type: String },
}, { timestamps: true });

export default mongoose.models.RDC || mongoose.model<IRDC>('RDC', rdcSchema);