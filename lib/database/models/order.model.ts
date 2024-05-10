import { Schema, model, models, Document } from 'mongoose';

// Documento de interfaz para poder acceder a las propiedades del Schema
export interface IOrder extends Document {
    // Propiedades
    createdAt: Date
    stripeId: string
    totalAmount: string
    event: {
        _id: string
        title: string
    }
    buyer: {
        _id: string
        firstName: string
        lastName: string
    }
}

// Type para definir el item del pedido (el Evento)
export type IOrderItem = {
    _id: string
    totalAmount: string
    createdAt: Date
    eventTitle: string
    eventId: string
    buyer: string
}

// Definiendo el Schema
const OrderSchema = new Schema({
    /* Definiendolas propiedades */
    createdAt: {
        type: Date,
        default: Date.now,
    },
    stripeId: {
        type: String,
        required: true,
        unique: true,
    },
    totalAmount: {
        type: String,
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
});

// Creando el modelo basado en el Schema
const Order = models.Order || model('Order', OrderSchema);

export default Order;