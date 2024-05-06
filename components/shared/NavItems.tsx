"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { headerLinks } from "@/constants";

// Componente que representará los items del Navbar
const NavItems = () => {
  // Para identificar la ruta actual en la que se encuentra el usuario
  const pathname = usePathname();

  return (
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {/* Recorriendo los encabezados */}
      {headerLinks.map((link) => {
        // Activar la siguiente clase cuando se este en el link que coincida con la ruta actual
        const isActive = pathname === link.route;

        return (
          <li
            key={link.route}
            className={`${
              isActive && "text-primary-500"
            } flex-center p-medium-16 whitespace-nowrap`}
          >
            <Link href={link.route}>{link.label}</Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItems;
