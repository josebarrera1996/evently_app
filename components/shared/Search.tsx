"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { Input } from "../ui/input";

// Componente para realizar búsquedas
const Search = ({
  placeholder = "Search title...",
}: {
  placeholder?: string;
}) => {
  // Estado para trackear lo que ingresamos
  const [query, setQuery] = useState("");

  // Hooks para manejar la navegación y obtener parámetros de búsqueda
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Función de retardo para esperar a que el usuario termine de escribir
    // De esta forma evitaremos llamadas en exceso a la API
    const delayDebounceFn = setTimeout(() => {
      let newUrl = "";

      // Si hay una consulta de búsqueda, formamos una nueva URL con el parámetro de consulta
      if (query) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: query,
        });
      } else {
        // Si no hay consulta de búsqueda, removemos el parámetro de consulta de la URL
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ["query"],
        });
      }

      // Navegamos a la nueva URL sin hacer scroll
      router.push(newUrl, { scroll: false });
    }, 300); 

    // Limpiamos el temporizador si el efecto se vuelve a ejecutar antes de que el temporizador termine
    return () => clearTimeout(delayDebounceFn);
  }, [query, searchParams, router]); 

  return (
    <div className="flex-center min-h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
      <Image
        src="/assets/icons/search.svg"
        alt="search"
        width={24}
        height={24}
      />
      <Input
        type="text"
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        className="p-regular-16 border-0 bg-grey-50 outline-offset-0 placeholder:text-grey-500 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
};

export default Search;
