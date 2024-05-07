import { Document, Schema, model, models } from "mongoose";

// Documento de interfaz para poder acceder a las propiedades del Schema
export interface IEvent extends Document {
    // Propiedades
    _id: string;
    title: string;
    description?: string;
    location?: string;
    createdAt: Date;
    imageUrl: string;
    startDateTime: Date;
    endDateTime: Date;
    price: string;
    isFree: boolean;
    url?: string;
    category: { _id: string, name: string }
    organizer: { _id: string, firstName: string, lastName: string }
}

// Definiendo el Schema
const EventSchema = new Schema({
    /* Definiendolas propiedades */
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    createdAt: { type: Date, default: Date.now },
    imageUrl: { type: String, required: true },
    startDateTime: { type: Date, default: Date.now },
    endDateTime: { type: Date, default: Date.now },
    price: { type: String },
    isFree: { type: Boolean, default: false },
    url: { type: String },

    // Referencias a otros Models
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    organizer: { type: Schema.Types.ObjectId, ref: 'User' },
});

// Creando el modelo basado en el Schema
const Event = models.Event || model('Event', EventSchema);

export default Event;