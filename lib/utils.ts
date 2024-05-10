import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import qs from 'query-string';
import { UrlQueryParams, RemoveUrlQueryParams } from '@/types';

// Función para combinar nombres de clases de Tailwind CSS
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Función para formatear fechas y horas
export const formatDateTime = (dateString: Date) => {
    // Opciones para formatear fecha y hora completa
    const dateTimeOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short', // día de la semana abreviado (ej. 'Lun')
        month: 'short', // nombre del mes abreviado (ej. 'Oct')
        day: 'numeric', // día del mes en número (ej. '25')
        hour: 'numeric', // hora en número (ej. '8')
        minute: 'numeric', // minuto en número (ej. '30')
        hour12: true, // usar reloj de 12 horas (true) o de 24 horas (false)
    };

    // Opciones para formatear solo la fecha
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short', // día de la semana abreviado (ej. 'Lun')
        month: 'short', // nombre del mes abreviado (ej. 'Oct')
        year: 'numeric', // año en número (ej. '2023')
        day: 'numeric', // día del mes en número (ej. '25')
    };

    // Opciones para formatear solo la hora
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric', // hora en número (ej. '8')
        minute: 'numeric', // minuto en número (ej. '30')
        hour12: true, // usar reloj de 12 horas (true) o de 24 horas (false)
    };

    // Formatear fecha y hora completa
    const formattedDateTime: string = new Date(dateString).toLocaleString('en-US', dateTimeOptions);

    // Formatear solo la fecha
    const formattedDate: string = new Date(dateString).toLocaleString('en-US', dateOptions);

    // Formatear solo la hora
    const formattedTime: string = new Date(dateString).toLocaleString('en-US', timeOptions);

    // Devolver objetos con las fechas y horas formateadas
    return {
        dateTime: formattedDateTime,
        dateOnly: formattedDate,
        timeOnly: formattedTime,
    };
}

// Función para convertir un archivo en una URL
export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

// Función para formatear un precio
export const formatPrice = (price: string) => {
    // Convertir el precio a un número
    const amount = parseFloat(price);
    // Formatear el precio como moneda en dólares estadounidenses
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);

    // Devolver el precio formateado
    return formattedPrice;
}

// Función para agregar o actualizar parámetros de consulta en la URL
export function formUrlQuery({ params, key, value }: UrlQueryParams) {
    // Obtener los parámetros de consulta actuales de la URL
    const currentUrl = qs.parse(params)

    // Agregar o actualizar el valor del parámetro de consulta especificado
    currentUrl[key] = value

    // Devolver la URL con los parámetros de consulta actualizados
    return qs.stringifyUrl(
        {
            url: window.location.pathname,
            query: currentUrl,
        },
        { skipNull: true }
    )
}

// Función para eliminar parámetros de consulta de la URL
export function removeKeysFromQuery({ params, keysToRemove }: RemoveUrlQueryParams) {
    // Obtener los parámetros de consulta actuales de la URL
    const currentUrl = qs.parse(params)

    // Eliminar los parámetros de consulta especificados
    keysToRemove.forEach(key => {
        delete currentUrl[key]
    })

    // Devolver la URL con los parámetros de consulta eliminados
    return qs.stringifyUrl(
        {
            url: window.location.pathname,
            query: currentUrl,
        },
        { skipNull: true }
    )
}

// Función para manejar errores
export const handleError = (error: unknown) => {
    console.error(error);
    // Lanzar un error con el mensaje de error
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
}