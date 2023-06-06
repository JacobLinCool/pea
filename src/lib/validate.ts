import type * as Type from "$lib/server/db/types";
import type { ColumnType } from "kysely";
import { z } from "zod";

export type Cast<T extends Record<never, unknown>> = {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	[K in keyof T]: T[K] extends ColumnType<infer _S, infer I, infer _U> ? I : T[K];
};

export const EmailSchema = z.string().max(128).email();
export const UrlSchema = z.string().max(1024).url();
export const BooleanSchema = z.number().int().min(0).max(1);

export const ApplicationSchema = z.object({
	id: z.number().int().nonnegative().describe("Application ID"),
	slug: z
		.string()
		.trim()
		.toLowerCase()
		.min(4)
		.max(128)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.describe("Application Slug"),
	created: z.string().datetime().max(128).describe("Application Creation Date"),
	active: BooleanSchema.describe("Application Active Status"),
	name: z.string().max(128).describe("Application Name"),
	accept_url: z.string().max(1024).describe("RegExp for Callback URL"),
	owner_email: EmailSchema.describe("Application Owner Email"),
	allowlist: z.string().max(1024).describe("RegExp for User Email"),
	description: z.string().max(1024).nullable().describe("Application Description"),
	url: UrlSchema.nullable().describe("Application Website URL"),
	logo: UrlSchema.nullable().describe("Application Logo URL"),
	color: z
		.string()
		.max(128)
		.regex(/^#[0-9a-f]{6}$/i)
		.nullable()
		.describe("Application Color"),
}) satisfies z.ZodSchema<Cast<Type.Application>>;

export const UserSchema = z.object({
	email: EmailSchema.describe("User Email"),
	created: z.string().datetime().max(128).describe("User Creation Date"),
	id: z
		.string()
		.trim()
		.toLowerCase()
		.min(4)
		.max(128)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.nullable()
		.describe("Public Profile ID"),
	name: z.string().max(128).nullable().describe("User Display Name"),
	bio: z.string().max(1024).nullable().describe("User Bio"),
	avatar: UrlSchema.nullable().describe("User Avatar URL"),
}) satisfies z.ZodSchema<Cast<Type.User>>;

export const MFASchema = z.object({
	user_email: EmailSchema,
	password: z.string().max(128).nullable(),
	otp_secret: z.string().max(128).nullable(),
}) satisfies z.ZodSchema<Cast<Type.MFA>>;

export const TokenSchema = z.object({
	id: z.string().max(128),
	ip: z.string().ip().max(128),
	user_agent: z.string().max(256).trim(),
	created: z.string().datetime().max(128),
	payload: z.string().max(256).nullable(),
	user_email: EmailSchema,
	app_id: z.number().int().nonnegative(),
	curve_id: z.number().int().nonnegative(),
}) satisfies z.ZodSchema<Cast<Type.Token>>;
