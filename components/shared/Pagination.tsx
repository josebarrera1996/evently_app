"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { formUrlQuery } from "@/lib/utils";

// Propiedades de este componente
type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

// Componente que activará la paginación
const Pagination = ({ page, totalPages, urlParamName }: PaginationProps) => {
  // Hooks para la navegación y obtener parámetros de búsqueda
  const router = useRouter();
  const searchParams = useSearchParams();

  // Función que se ejecuta al hacer clic en los botones de paginación
  const onClick = (btnType: string) => {
    // Determina el valor de la página siguiente o anterior según el botón clicado
    const pageValue = btnType === "next" ? Number(page) + 1 : Number(page) - 1;

    // Crea la nueva URL con el parámetro de página actualizado
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || "page",
      value: pageValue.toString(),
    });

    // Navega a la nueva URL sin hacer scroll
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="flex gap-2">
      {/* Botón para ir a la página anterior */}
      <Button
        size="lg"
        variant="outline"
        className="w-28"
        onClick={() => onClick("prev")}
        disabled={Number(page) <= 1} // Deshabilitado si estamos en la primera página
      >
        Previous
      </Button>
      {/* Botón para ir a la página siguiente */}
      <Button
        size="lg"
        variant="outline"
        className="w-28"
        onClick={() => onClick("next")}
        disabled={Number(page) >= totalPages} // Deshabilitado si estamos en la última página
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
