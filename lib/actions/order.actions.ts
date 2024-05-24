"use server"

import Stripe from 'stripe';
import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from "@/types"
import { redirect } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { handleError } from '../utils';
import { connectToDatabase } from '../database';
import Order from '../database/models/order.model';
import Event from '../database/models/event.model';
import User from '../database/models/user.model';

// Función para realizar el checkout de una orden
export const checkoutOrder = async (order: CheckoutOrderParams) => {
    // Inicializar Stripe con la clave secreta
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Calcular el precio en centavos (Stripe maneja los precios en la menor unidad de la moneda)
    const price = order.isFree ? 0 : Number(order.price) * 100;

    try {
        // Crear una sesión de pago en Stripe
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd', // Moneda en la que se realizará el pago
                        unit_amount: price, // Precio en centavos
                        product_data: {
                            name: order.eventTitle // Nombre del evento
                        }
                    },
                    quantity: 1 // Cantidad de items (en este caso, 1)
                },
            ],
            metadata: {
                eventId: order.eventId, // ID del evento
                buyerId: order.buyerId, // ID del comprador
            },
            mode: 'payment', // Modo de la sesión (pago)
            success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`, // URL a la que redirigir en caso de éxito
            cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`, // URL a la que redirigir en caso de cancelación
        });

        // Redirigir al usuario a la URL de la sesión de pago
        redirect(session.url!);
    } catch (error) {
        // Lanzar cualquier error que ocurra durante el proceso de creación de la sesión de pago
        throw error;
    }
}

// Función para crear una nueva orden
export const createOrder = async (order: CreateOrderParams) => {
    try {
        // Conectar a la base de datos
        await connectToDatabase();

        // Crear una nueva orden en la base de datos con los datos proporcionados
        const newOrder = await Order.create({
            ...order, // Copiar todos los campos de la orden proporcionada
            event: order.eventId, // Asignar el ID del evento a la orden
            buyer: order.buyerId, // Asignar el ID del comprador a la orden
        });

        // Devolver la nueva orden creada, parseada como JSON
        return JSON.parse(JSON.stringify(newOrder));
    } catch (error) {
        // Manejar cualquier error que ocurra durante el proceso
        handleError(error);
    }
}

// Función para obtener órdenes relacionadas con un evento específico
export async function getOrdersByEvent({ searchString, eventId }: GetOrdersByEventParams) {
    try {
        // Conectar a la base de datos
        await connectToDatabase();

        // Verificar que se proporcione un ID de evento
        if (!eventId) throw new Error('Event ID is required');

        // Convertir el ID del evento a un ObjectId de MongoDB
        const eventObjectId = new ObjectId(eventId);

        // Realizar una consulta agregada para obtener las órdenes relacionadas con el evento
        const orders = await Order.aggregate([
            {
                $lookup: {
                    from: 'users', // Unir con la colección de usuarios
                    localField: 'buyer', // Campo local de la orden (ID del comprador)
                    foreignField: '_id', // Campo de la colección de usuarios (ID del usuario)
                    as: 'buyer', // Nombre del campo resultante después de la unión
                },
            },
            {
                $unwind: '$buyer', // Desempaquetar el campo 'buyer' (convertir de array a objeto)
            },
            {
                $lookup: {
                    from: 'events', // Unir con la colección de eventos
                    localField: 'event', // Campo local de la orden (ID del evento)
                    foreignField: '_id', // Campo de la colección de eventos (ID del evento)
                    as: 'event', // Nombre del campo resultante después de la unión
                },
            },
            {
                $unwind: '$event', // Desempaquetar el campo 'event' (convertir de array a objeto)
            },
            {
                $project: {
                    _id: 1, // Incluir el campo '_id'
                    totalAmount: 1, // Incluir el campo 'totalAmount'
                    createdAt: 1, // Incluir el campo 'createdAt'
                    eventTitle: '$event.title', // Incluir el título del evento
                    eventId: '$event._id', // Incluir el ID del evento
                    buyer: {
                        // Concatenar el nombre y apellido del comprador
                        $concat: ['$buyer.firstName', ' ', '$buyer.lastName'],
                    },
                },
            },
            {
                $match: {
                    // Filtrar los resultados para que coincidan con el ID del evento y el nombre del comprador
                    $and: [{ eventId: eventObjectId }, { buyer: { $regex: RegExp(searchString, 'i') } }],
                },
            },
        ]);

        // Devolver las órdenes obtenidas, convertidas a JSON
        return JSON.parse(JSON.stringify(orders));
    } catch (error) {
        // Manejar cualquier error que ocurra durante el proceso
        handleError(error);
    }
}

// Función para obtener las órdenes realizadas por un usuario específico
export async function getOrdersByUser({ userId, limit = 3, page }: GetOrdersByUserParams) {
    try {
        // Conectar a la base de datos
        await connectToDatabase();

        // Calcular la cantidad de documentos a omitir basado en la paginación
        const skipAmount = (Number(page) - 1) * limit;

        // Condiciones de búsqueda para encontrar órdenes por ID de comprador
        const conditions = { buyer: userId };

        // Buscar las órdenes que coincidan con las condiciones, ordenando por fecha de creación en orden descendente,
        // aplicando paginación y populando los campos relacionados (evento y organizador del evento)
        const orders = await Order.find(conditions)
            .sort({ createdAt: 'desc' })
            .skip(skipAmount)
            .limit(limit)
            .populate({
                path: 'event', // Popular el campo 'event' en las órdenes
                model: Event,
                populate: {
                    path: 'organizer', // Popular el campo 'organizer' en los eventos
                    model: User,
                    select: '_id firstName lastName', // Seleccionar solo ciertos campos del organizador
                },
            });

        // Contar el total de documentos que coinciden con las condiciones de búsqueda
        const ordersCount = await Order.countDocuments(conditions);

        // Devolver las órdenes obtenidas y el número total de páginas
        return { data: JSON.parse(JSON.stringify(orders)), totalPages: Math.ceil(ordersCount / limit) };
    } catch (error) {
        // Manejar cualquier error que ocurra durante el proceso
        handleError(error);
    }
}