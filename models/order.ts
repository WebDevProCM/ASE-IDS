import mongoose from 'mongoose';

export type OrderStatus = 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  rdcId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  status: OrderStatus;
}

export interface IOrder {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryAddress: string;
  deliveryDate?: Date;
  invoiceNumber?: string;
  createdAt: Date;
}

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rdcId: { type: mongoose.Schema.Types.ObjectId, ref: 'RDC', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  }
});

const orderSchema = new mongoose.Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  deliveryAddress: { type: String, required: true },
  deliveryDate: { type: Date },
  invoiceNumber: { type: String },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);