import mongoose from 'mongoose';

export type DeliveryStatus = 'assigned' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'failed';

export interface IDelivery {
  orderId: mongoose.Types.ObjectId;
  logisticsOfficerId: mongoose.Types.ObjectId;
  vehicleNumber: string;
  driverName: string;
  driverContact: string;
  status: DeliveryStatus;
  estimatedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  deliveryNotes?: string;
  trackingUpdates: {
    status: DeliveryStatus;
    location: string;
    timestamp: Date;
    notes?: string;
  }[];
}

const trackingUpdateSchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed'],
    required: true 
  },
  location: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String }
});

const deliverySchema = new mongoose.Schema<IDelivery>({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  logisticsOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  driverContact: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed'],
    default: 'assigned'
  },
  estimatedDeliveryDate: { type: Date, required: true },
  actualDeliveryDate: { type: Date },
  deliveryNotes: { type: String },
  trackingUpdates: [trackingUpdateSchema]
}, { timestamps: true });

export default mongoose.models.Delivery || mongoose.model<IDelivery>('Delivery', deliverySchema);