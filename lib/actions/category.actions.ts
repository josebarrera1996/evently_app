"use server";

import { CreateCategoryParams } from "@/types";
import { connectToDatabase } from "../database";
import Category from "../database/models/category.model";
import { handleError } from "../utils";

/* Definiendo las acciones de servidor para interactuar con la B.D */

// Lógica para crear una nueva categoría
export async function createCategory({ categoryName }: CreateCategoryParams) {
    try {
        // Conexión a la B.D
        await connectToDatabase();

        // Creación de la categoría
        const newCategory = await Category.create({ name: categoryName });

        // Retornar en JSON de la categoría creada
        return JSON.parse(JSON.stringify(newCategory));
    } catch (error) {
        // Invocando el manejador de excepciones de errores
        handleError(error);
    }
}

// Lógica para obtener todas las categorías
export async function getAllCategories() {
    try {
        // Conexión a la B.D
        await connectToDatabase();

        // Obtener las categorías
        const categories = await Category.find();

        // Retornarlas en formato JSON
        return JSON.parse(JSON.stringify(categories));
    } catch (error) {
        // Invocando el manejador de excepciones de errores
        handleError(error);
    }
}