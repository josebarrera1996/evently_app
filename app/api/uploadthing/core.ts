import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Función de autenticación falsa

// FileRouter para tu aplicación, puede contener múltiples FileRoutes
export const ourFileRouter = {
    // Define tantas FileRoutes como desees, cada una con un routeSlug único
    imageUploader: f({ image: { maxFileSize: "4MB" } })
        // Establece permisos y tipos de archivo para esta FileRoute
        .middleware(async ({ req }) => {
            // Este código se ejecuta en tu servidor antes de la carga
            const user = await auth(req);

            // Si lanzas una excepción, el usuario no podrá cargar archivos
            if (!user) throw new Error("No autorizado");

            // Lo que se devuelva aquí es accesible en onUploadComplete como `metadata`
            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // Este código SE EJECUTA EN TU SERVIDOR después de la carga
            console.log("Carga completa para el ID de usuario:", metadata.userId);

            console.log("URL del archivo", file.url);

            // !!! Lo que se devuelva aquí se envía a la devolución de llamada `onClientUploadComplete` del lado del cliente
            return { subidoPor: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
