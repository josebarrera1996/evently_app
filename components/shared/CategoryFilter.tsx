"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllCategories } from "@/lib/actions/category.actions";
import { ICategory } from "@/lib/database/models/category.model";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Componente para filtrar categorías
const CategoryFilter = () => {
  // Estado para manejar las categorías obtenidas
  const [categories, setCategories] = useState<ICategory[]>([]);

  // Hooks de Next.js para la navegación y obtener parámetros de búsqueda
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Función asincrónica para obtener las categorías
    const getCategories = async () => {
      const categoryList = await getAllCategories();

      // Si se obtienen categorías, actualizar el estado
      if (categoryList) setCategories(categoryList as ICategory[]);
    };

    // Llamar a la función para obtener las categorías
    getCategories();
  }, []); // Solo se ejecuta una vez al montar el componente

  // Función para manejar la selección de una categoría
  const onSelectCategory = (category: string) => {
    let newUrl = "";

    // Si se selecciona una categoría específica, formar una nueva URL con el parámetro de categoría
    if (category && category !== "All") {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "category",
        value: category,
      });
    } else {
      // Si se selecciona "All", remover el parámetro de categoría de la URL
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ["category"],
      });
    }

    // Navegar a la nueva URL sin hacer scroll
    router.push(newUrl, { scroll: false });
  };

  return (
    <Select onValueChange={(value: string) => onSelectCategory(value)}>
      <SelectTrigger className="select-field">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        {/* Opción para todas las categorías */}
        <SelectItem value="All" className="select-item p-regular-14">
          All
        </SelectItem>

        {/* Mapear y mostrar cada categoría obtenida */}
        {categories.map((category) => (
          <SelectItem
            value={category.name}
            key={category._id}
            className="select-item p-regular-14"
          >
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategoryFilter;
