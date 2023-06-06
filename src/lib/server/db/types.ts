import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Application = {
	id: Generated<number>;
	slug: string;
	created: Generated<string>;
	/**
	 * Whether the application is enabled
	 */
	active: Generated<number>;
	name: string;
	/**
	 * The RegEx checker for the callback URL
	 */
	accept_url: string;
	owner_email: string;
	/**
	 * The RegEx checker for the application user email
	 */
	allowlist: string;
	description: string | null;
	url: string | null;
	logo: string | null;
	color: string | null;
};
export type Curve = {
	id: Generated<number>;
	created: Generated<string>;
	revoked: Generated<number>;
	crv: string;
	x: string;
	y: string;
	d: string;
};
export type MFA = {
	user_email: string;
	password: string | null;
	otp_secret: string | null;
};
export type Token = {
	id: string;
	ip: string;
	user_agent: string;
	created: Generated<string>;
	user_email: string;
	app_id: number;
	curve_id: number;
	payload: string | null;
};
export type User = {
	email: string;
	created: Generated<string>;
	/**
	 * The public profile ID
	 */
	id: string | null;
	/**
	 * The public profile display name
	 */
	name: string | null;
	/**
	 * The public profile biography
	 */
	bio: string | null;
	/**
	 * The public profile avatar URL
	 */
	avatar: string | null;
};
export type DB = {
	Application: Application;
	Curve: Curve;
	MFA: MFA;
	Token: Token;
	User: User;
};
