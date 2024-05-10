import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions';

// Función para manejar solicitudes POST a la API Route
export async function POST(req: Request) {

    // Obtener el valor de la variable de entorno
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // Obtener los 'headers'
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // Si no se los encontró...
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400
        })
    }

    // Obtener el 'body'
    const payload = await req.json()
    const body = JSON.stringify(payload);

    // Crear una nueva instancia 'Svix' con la clave secreta proporcionada
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verificar el 'payload' con los 'headers'
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occured', {
            status: 400
        })
    }

    // Obtener el ID y el tipo
    const { id } = evt.data;
    const eventType = evt.type;

    // Si el usuario pudo logearse 
    if (eventType === 'user.created') {
        // Extraer datos relevantes del evento
        const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

        // Crear un objeto de usuario con los datos extraídos
        const user = {
            clerkId: id,
            email: email_addresses[0].email_address,
            username: username!,
            firstName: first_name,
            lastName: last_name,
            photo: image_url,
        }

        // Crear el usuario en la base de datos
        const newUser = await createUser(user);

        // Actualizar los metadatos del usuario en Clerk
        if (newUser) {
            await clerkClient.users.updateUserMetadata(id, {
                publicMetadata: {
                    userId: newUser._id
                }
            })
        }

        // Devolver una respuesta JSON con el nuevo usuario creado
        return NextResponse.json({ message: 'OK', user: newUser })
    }

    // Si se busca actualizar un usuario
    if (eventType === 'user.updated') {
        // Extraer datos relevantes del evento
        const { id, image_url, first_name, last_name, username } = evt.data

        // Crear un objeto de usuario con los datos actualizados
        const user = {
            firstName: first_name,
            lastName: last_name,
            username: username!,
            photo: image_url,
        }

        // Actualizar el usuario en la base de datos
        const updatedUser = await updateUser(id, user)

        // Devolver una respuesta JSON con el usuario actualizado
        return NextResponse.json({ message: 'OK', user: updatedUser })
    }

    // Si se busca eliminar un usuario
    if (eventType === 'user.deleted') {
        // Extraer el ID del usuario a eliminar
        const { id } = evt.data

        // Eliminar el usuario de la base de datos
        const deletedUser = await deleteUser(id!)

        // Devolver una respuesta JSON con el usuario eliminado
        return NextResponse.json({ message: 'OK', user: deletedUser })
    }

    // Devolver una respuesta vacía con estado 200 si no se maneja el evento
    return new Response('', { status: 200 })
}