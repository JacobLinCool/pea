import api from "$api";
import type { RequestHandler } from "./$types";

export const POST = ((evt) => api.handle(evt)) satisfies RequestHandler;
export const OPTIONS = ((evt) => api.handle(evt)) satisfies RequestHandler;
