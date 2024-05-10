import { Document, Schema, model, models } from "mongoose";

// Documento de interfaz para poder acceder a las propiedades del Schema
export interface ICategory extends Document {
    // Propiedades
    _id: string;
    name: string;
};

// Definiendo el Schema
const CategorySchema = new Schema({
    /* Propiedades */
    name: { type: String, required: true, unique: true },
});

// Creando el modelo basado en el Schema
const Category = models.Category || model('Category', CategorySchema);

export default Category;