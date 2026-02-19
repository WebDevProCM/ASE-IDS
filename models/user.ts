import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'customer' | 'rdc_staff' | 'logistics' | 'ho_manager';

export interface IUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  rdcId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'customer', 'rdc_staff', 'logistics', 'ho_manager'],
    required: true 
  },
  rdcId: { type: mongoose.Schema.Types.ObjectId, ref: 'RDC' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);