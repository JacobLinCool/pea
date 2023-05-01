import { z } from "zod";

export interface Developer {
	id: string;
	email: string;
	name: string;
	created: number;
}

export interface Application {
	id: string;
	owner: string;
	name: string;
	description: string;
	secret: string;
	domain: string;
	created: number;
	active: boolean;
	allowlist: string;
}

export interface User {
	email: string;
	created: number;
}

export interface Login {
	id: string;
	app: string;
	user: string;
	time: number;
	ip: string;
}

export interface Database {
	Developer: Developer;
	Application: Application;
	User: User;
	Login: Login;
}

export const DeveloperSchema = z.object({
	id: z
		.string()
		.min(3)
		.max(128)
		.regex(/^[a-z0-9-]+$/),
	email: z.string().max(128).email(),
	name: z.string().min(3).max(128),
	created: z.number().int().positive(),
}) satisfies z.ZodSchema<Developer>;

export const ApplicationSchema = z.object({
	id: z
		.string()
		.min(3)
		.max(128)
		.regex(/^[a-z0-9-]+$/),
	owner: z
		.string()
		.min(3)
		.max(128)
		.regex(/^[a-z0-9-]+$/),
	name: z.string().min(3).max(128),
	description: z.string().min(0).max(1024),
	secret: z.string().min(12).max(256),
	domain: z.string().min(3).max(256),
	created: z.number().int().positive(),
	active: z.boolean(),
	allowlist: z.string().min(0).max(256),
}) satisfies z.ZodSchema<Application>;

export const UserSchema = z.object({
	email: z.string().max(128).email(),
	created: z.number().int().positive(),
}) satisfies z.ZodSchema<User>;

export const LoginSchema = z.object({
	id: z.string(),
	app: z
		.string()
		.min(3)
		.max(128)
		.regex(/^[a-z0-9-]+$/),
	user: z.string().max(128).email(),
	time: z.number().int().positive(),
	ip: z.string().ip(),
}) satisfies z.ZodSchema<Login>;
