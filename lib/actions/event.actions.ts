"use server";

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from "../database";
import {
    CreateEventParams,
    GetAllEventsParams,
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

// Lógica para traer a una Category por su nombre
const getCategoryByName = async (name: string) => {
    return Category.findOne({ name: { $regex: name, $options: 'i' } })
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

// Lógica para traer a todos los Event
export async function getAllEvents({ query, limit = 6, page, category }: GetAllEventsParams) {
    try {
        // Conexión a la base de datos
        await connectToDatabase();

        // Condición de búsqueda por título usando regex para una búsqueda insensible a mayúsculas
        const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : {};

        // Condición de búsqueda por categoría obteniendo el ID de la categoría si se proporciona
        const categoryCondition = category ? await getCategoryByName(category) : null;

        // Combinación de condiciones de búsqueda con operador $and
        const conditions = {
            $and: [titleCondition, categoryCondition ? { category: categoryCondition._id } : {}],
        };

        // Cálculo de la cantidad de documentos a omitir basado en la paginación
        const skipAmount = (Number(page) - 1) * limit;

        // Construcción de la consulta para obtener los eventos con las condiciones dadas,
        // ordenando por fecha de creación en orden descendente, aplicando paginación
        const eventsQuery = Event.find(conditions)
            .sort({ createdAt: 'desc' })
            .skip(skipAmount)
            .limit(limit);

        // Popular los campos relacionados en la consulta de eventos
        const events = await populateEvent(eventsQuery);

        // Contar el total de documentos que coinciden con las condiciones de búsqueda
        const eventsCount = await Event.countDocuments(conditions);

        // Devolver los eventos obtenidos y el número total de páginas
        return {
            data: JSON.parse(JSON.stringify(events)),
            totalPages: Math.ceil(eventsCount / limit),
        };
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