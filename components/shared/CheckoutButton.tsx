"use client";

import React from "react";
import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { IEvent } from "@/lib/database/models/event.model";
import { Button } from "../ui/button";
import Checkout from "./Checkout";

// Componente para poder empezar el trámite del pago del ticket
const CheckoutButton = ({ event }: { event: IEvent }) => {
  // Obtener el id del usuario que está realizando la compra
  const { user } = useUser();
  const userId = user?.publicMetadata.userId as string;

  // Constante para manejar si el Event ya ha terminado
  const hasEventFinished = new Date(event.endDateTime) < new Date();

  return (
    <div className="flex items-center gap-3">
      {/* Sección a mostrar si el Event ya ha terminado (no podremos comprarlo) */}
      {hasEventFinished ? (
        <p className="p-2 text-red-400">
          Sorry, tickets are no longer available.
        </p>
      ) : (
        <>
          {/* Si el usuario no está logeado, deberá hacerlo para poder realizar el Checkout*/}
          <SignedOut>
            <Button asChild className="button rounded-full" size="lg">
              <Link href="/sign-in">Get Tickets</Link>
            </Button>
          </SignedOut>
          {/* En caso de estar logeado, si podrá realizar el Checkout */}
          <SignedIn>
            <Checkout event={event} userId={userId} />
          </SignedIn>
        </>
      )}
    </div>
  );
};

export default CheckoutButton;
