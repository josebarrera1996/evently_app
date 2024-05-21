import { auth } from "@clerk/nextjs";
import EventForm from "@/components/shared/EventForm";
import { getEventById } from "@/lib/actions/event.actions";

// Propiedades de este componente
type UpdateEventProps = {
  params: {
    id: string;
  };
};

// Componente para poder actualizar un Evento
const UpdateEvent = async ({ params: { id } }: UpdateEventProps) => {
  // Constante para manejar las propiedades del usuario logeado
  const { sessionClaims } = auth();

  // Obtener el id del usuario logeado
  const userId = sessionClaims?.userId as string;

  // Obtener los datos del Event (por su ID)
  const event = await getEventById(id);

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Update Event
        </h3>
      </section>

      {/* Formulario para poder editar el Evento */}
      <div className="wrapper my-8">
        {/*
         * Se le pasará el id del usuario que está interactuando con el formulario
         * Se le pasará el tipo de 'event'
         */}
        <EventForm
          type="Update"
          event={event}
          eventId={event._id}
          userId={userId}
        />
      </div>
    </>
  );
};

export default UpdateEvent;
