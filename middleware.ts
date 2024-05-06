import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
    // Definiendo las rutas públicas (aun sin logear, se podrán acceder)
    publicRoutes: [
        '/',
        '/events/:id',
        '/api/webhook/clerk',
        '/api/webhook/stripe',
        '/api/uploadthing'
    ],
    // Definiendo las rutas a ignorar por el middleware
    ignoredRoutes: [
        '/api/webhook/clerk',
        '/api/webhook/stripe',
        '/api/uploadthing'
    ]
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
