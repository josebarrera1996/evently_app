"use server";

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from "../database";
import {
    CreateEventParams,
} from '@/types';
import User from '@/lib/database/models/user.model';
import Event from '@/lib/database/models/event.model';
import Category from '@/lib/database/models/category.model';
import { handleError } from "../utils";

// Lógica para poder popular el Event
const populateEvent = (query: any) => {
    // Además de los '_id' de las colecciones relacionadas, traer más campos de los mismos
    return query
        .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
        .populate({ path: 'category', model: Category, select: '_id name' })
}

/* Definiendo las acciones de servidor para interactuar con la B.D */

// Lógica para poder crear un nuevo evento
export async function createEvent({ userId, event, path }: CreateEventParams) {
    try {
        // Conexión a la B.D
        await connectToDatabase();

        // Encontrar el usuario logeado (el organizador del evento)
        const organizer = await User.findById(userId);
        if (!organizer) throw new Error('Organizer not found');

        // Crear y guardar el nuevo evento en la B.D
        const newEvent = await Event.create({ ...event, category: event.categoryId, organizer: userId });

        // Revalidar el cache del path especificado
        revalidatePath(path);

        // Retornar el nuevo evento creado (JSON)
        return JSON.parse(JSON.stringify(newEvent));
    } catch (error) {
        // Invocar manejador de errores
        handleError(error);
    }
}

// Lógica para traer los datos de un Event (por su ID)
export async function getEventById(eventId: string) {
    try {
        // Conexión a la B.D
        await connectToDatabase();

        // Intentar obtener el Event y popularlo 
        const event = await populateEvent(Event.findById(eventId));
        if (!event) throw new Error('Event not found');

        // Retornar el Event en JSON
        return JSON.parse(JSON.stringify(event));
    } catch (error) {
        // Invocar manejador de errores
        handleError(error);
    }
}