import api from "$api";
import type { RequestHandler } from "./$types";

export const GET = ((evt) => api.handle(evt)) satisfies RequestHandler;
export const POST = ((evt) => api.handle(evt)) satisfies RequestHandler;
export const PUT = ((evt) => api.handle(evt)) satisfies RequestHandler;
export const DELETE = ((evt) => api.handle(evt)) satisfies RequestHandler;
export const OPTIONS = ((evt) => api.handle(evt)) satisfies RequestHandler;
