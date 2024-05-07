import mongoose from 'mongoose';

// Definir la URI de conexión a MongoDB desde la variable de entorno
const MONGODB_URI = process.env.MONGODB_URI;

// Crear un objeto de caché para almacenar la conexión
let cached = (global as any).mongoose || { conn: null, promise: null };

/**
 * Se conecta a la base de datos MongoDB de forma asíncrona
 *
 * Esta función comprueba si una conexión ya está en caché. Si no es así, recupera
 * la URI de conexión a MongoDB de la variable de entorno y se conecta a la
 * base de datos. Se lanza un error si la variable de entorno MONGODB_URI no está presente.
 *
 * @returns {Promise<mongoose.Connection>} Una promesa que se resuelve con el objeto de conexión mongoose
 */
export const connectToDatabase = async () => {
    // Si la conexión ya está en caché, devolverla
    if (cached.conn) {
        return cached.conn;
    }

    // Lanzar un error si MONGODB_URI no está configurado en las variables de entorno
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is missing. Please set the MONGODB_URI environment variable to your MongoDB connection string.');
    }

    // Si no está en caché, crear una promesa para la conexión
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName: 'evently_db', // Establecer el nombre de la base de datos a 'evently_db'
            bufferCommands: false, // Deshabilitar el almacenamiento en búfer de comandos para un mejor rendimiento
        });
    }

    // Esperar a que la promesa de conexión se resuelva y almacenarla en la caché
    cached.conn = await cached.promise;

    // Devolver la conexión en caché
    return cached.conn;
};