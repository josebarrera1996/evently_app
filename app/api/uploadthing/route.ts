import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Exportando estas rutas para el App Router
export const { GET, POST } = createNextRouteHandler({
    router: ourFileRouter,
});