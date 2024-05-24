import stripe from 'stripe'
import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/actions/order.actions';

// Función para manejar la solicitud POST del webhook de Stripe
export async function POST(request: Request) {
    // Leer el cuerpo de la solicitud como texto
    const body = await request.text();

    // Obtener la firma del webhook de los encabezados de la solicitud
    const sig = request.headers.get('stripe-signature') as string;
    // Obtener el secreto del webhook desde las variables de entorno
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;

    try {
        // Construir el evento del webhook de Stripe para verificar su autenticidad
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        // Si ocurre un error al construir el evento, responder con un mensaje de error
        return NextResponse.json({ message: 'Webhook error', error: err });
    }

    // Obtener el tipo de evento del webhook
    const eventType = event.type;

    // Manejar el evento de sesión de pago completada
    if (eventType === 'checkout.session.completed') {
        const { id, amount_total, metadata } = event.data.object;

        // Crear un objeto de orden con los datos del evento
        const order = {
            stripeId: id, // ID de Stripe de la sesión de pago
            eventId: metadata?.eventId || '', // ID del evento asociado
            buyerId: metadata?.buyerId || '', // ID del comprador
            totalAmount: amount_total ? (amount_total / 100).toString() : '0', // Monto total pagado, convertido a dólares
            createdAt: new Date(), // Fecha de creación de la orden
        };

        // Crear la orden en la base de datos
        const newOrder = await createOrder(order);

        // Responder con un mensaje de éxito y la nueva orden creada
        return NextResponse.json({ message: 'OK', order: newOrder });
    }

    // Responder con un estado 200 para otros tipos de eventos
    return new Response('', { status: 200 });
}