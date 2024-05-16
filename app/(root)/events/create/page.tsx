import EventForm from "@/components/shared/EventForm";
import { auth } from "@clerk/nextjs";

// Componente para poder crear un Evento
const CreateEvent = () => {
  // Constante para manejar las propiedades del usuario logeado
  const { sessionClaims } = auth();

  // Obtener el id del usuario logeado
  const userId = sessionClaims?.userId as string;
  console.log(userId);

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Create Event
        </h3>
      </section>

      {/* Formulario para poder crear el Evento */}
      <div className="wrapper my-8">
        {/*
         * Se le pasará el id del usuario que está interactuando con el formulario
         * Se le pasará el tipo de 'event'
         */}
        <EventForm userId={userId} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;
