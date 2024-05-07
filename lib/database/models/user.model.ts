import { Schema, model, models } from "mongoose";

// Definiendo el Schema
const UserSchema = new Schema({
    /* Propiedades */

    // 'clerkId' es necesario para poder conectar al usuario de Clerk con el usuario de la B.D
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    photo: { type: String, required: true },
})

// Creando el modelo basado en el Schema
const User = models.User || model('User', UserSchema);

export default User;