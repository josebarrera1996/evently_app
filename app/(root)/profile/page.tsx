import { auth } from "@clerk/nextjs";
import Link from "next/link";
import { SearchParamProps } from "@/types";
import { Button } from "@/components/ui/button";
import Collection from "@/components/shared/Collection";
import { getEventsByUser } from "@/lib/actions/event.actions";
import { getOrdersByUser } from "@/lib/actions/order.actions";
import { IOrder } from "@/lib/database/models/order.model";

// Componente para representar el perfil del usuario logeado
const ProfilePage = async ({ searchParams }: SearchParamProps) => {
  // Datos del usuario logeado
  const { sessionClaims } = auth();
  const userId = sessionClaims?.userId as string;

  // Obteniendo las props de paginación de Events & Orders
  const ordersPage = Number(searchParams?.ordersPage) || 1;
  const eventsPage = Number(searchParams?.eventsPage) || 1;

  // Obtener las Orders realizadas por el User
  const orders = await getOrdersByUser({ userId, page: ordersPage });

  // Mapear las Orders para obtener solo la información del Event
  const orderedEvents = orders?.data.map((order: IOrder) => order.event) || [];

  // Obtener los Event del usuario organizador (el logeado)
  const organizedEvents = await getEventsByUser({ userId, page: eventsPage });

  return (
    <>
      {/* Tickets de eventos adquiridos */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">My Tickets</h3>
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href="/#events">Explore More Events</Link>
          </Button>
        </div>
      </section>
      <section className="wrapper my-8">
        <Collection
          data={orderedEvents}
          emptyTitle="No event tickets purchased yet"
          emptyStateSubtext="No worries - plenty of exciting events to explore!"
          collectionType="My_Tickets"
          limit={3}
          page={ordersPage}
          urlParamName="ordersPage"
          totalPages={orders?.totalPages}
        />
      </section>

      {/* Eventos organizados */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">Events Organized</h3>
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href="/events/create">Create New Event</Link>
          </Button>
        </div>
      </section>
      <section className="wrapper my-8">
        <Collection
          data={organizedEvents?.data}
          emptyTitle="No events have been created yet"
          emptyStateSubtext="Go create some now"
          collectionType="Events_Organized"
          limit={3}
          page={eventsPage}
          urlParamName="eventsPage"
          totalPages={organizedEvents?.totalPages}
        />
      </section>
    </>
  );
};

export default ProfilePage;
