'use server';

import { revalidatePath } from 'next/cache';
import { CreateUserParams, UpdateUserParams } from "@/types";
import { connectToDatabase } from "../database";
import User from '@/lib/database/models/user.model';
import Order from '@/lib/database/models/order.model';
import Event from '@/lib/database/models/event.model';
import { handleError } from "../utils";

/* Definiendo las acciones de servidor para interactuar con la B.D */

// Lógica para crear un usuario
export async function createUser(user: CreateUserParams) {
    try {
        // Conexión a la B.D
        await connectToDatabase();

        // Creación del usuario
        const newUser = await User.create(user);

        // Retornar en JSON el usuario creado
        return JSON.parse(JSON.stringify(newUser));
    } catch (error) {
        // Invocando el manejador de excepciones de errores
        handleError(error);
    }
}

// Lógica para poder obtener un usuario por el ID
export async function getUserById(userId: string) {
    try {
        // Conexión a la B.D
        await connectToDatabase();

        // Intentando encontrar el usuario
        const user = await User.findById(userId);

        // Si no se lo encontró...
        if (!user) throw new Error('User not found');
        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        // Invocando el manejador de excepciones de errores
        handleError(error);
    }
}

// Lógica para poder actualizar un usuario por su ID
export async function updateUser(clerkId: string, user: UpdateUserParams) {
    try {
        // Conexión a la B.D
        await connectToDatabase();

        // Tratar de encontrar el usuario y actualizarlo
        const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true });

        // En caso de no poder encontrarlo y/o actualizarlo
        if (!updatedUser) throw new Error('User update failed');
        return JSON.parse(JSON.stringify(updatedUser));
    } catch (error) {
        // Invocando el manejador de excepciones de errores
        handleError(error);
    }
}

// Lógica para eliminar a un usuario por su ID
export async function deleteUser(clerkId: string) {
    try {
        // Conexión a la B.D
        await connectToDatabase();

        // Tratar de encontrar el usuario por su ID
        const userToDelete = await User.findOne({ clerkId });

        if (!userToDelete) {
            throw new Error('User not found');
        }

        // Eliminando relaciones
        await Promise.all([
            // Actualizar la colección 'events' para remover las referencias a el usuario
            Event.updateMany(
                { _id: { $in: userToDelete.events } },
                { $pull: { organizer: userToDelete._id } }
            ),

            // Actualizar la colección 'orders' para remover las referencias a el usuario
            Order.updateMany({ _id: { $in: userToDelete.orders } }, { $unset: { buyer: 1 } }),
        ]);

        // Eliminar el usuario
        const deletedUser = await User.findByIdAndDelete(userToDelete._id);
        revalidatePath('/'); // Refrescar la data

        return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
    } catch (error) {
        // Invocando el manejador de excepciones de errores
        handleError(error);
    }
}

