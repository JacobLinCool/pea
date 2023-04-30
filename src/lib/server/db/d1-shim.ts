/* eslint-disable no-fallthrough */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable @typescript-eslint/no-explicit-any */
// adapted from https://github.com/cloudflare/workers-sdk/blob/main/packages/wrangler/templates/d1-beta-facade.js

export class D1Database {
	constructor(binding) {
		this.binding = binding;
	}
	prepare(query) {
		return new D1PreparedStatement(this, query);
	}
	async dump() {
		const response = await this.binding.fetch("http://d1/dump", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
		});
		if (response.status !== 200) {
			try {
				const err = await response.json();
				throw new Error("D1_DUMP_ERROR", {
					cause: new Error(err.error),
				});
			} catch (e) {
				throw new Error("D1_DUMP_ERROR", {
					cause: new Error("Status " + response.status),
				});
			}
		}
		return await response.arrayBuffer();
	}
	async batch(statements) {
		const exec = await this._send(
			"/query",
			statements.map((s) => s.statement),
			statements.map((s) => s.params),
		);
		return exec;
	}
	async exec(query) {
		const lines = query.trim().split("\n");
		const _exec = await this._send("/query", lines, [], false);
		const exec = Array.isArray(_exec) ? _exec : [_exec];
		const error = exec
			.map((r) => {
				return r.error ? 1 : 0;
			})
			.indexOf(1);
		if (error !== -1) {
			throw new Error("D1_EXEC_ERROR", {
				cause: new Error(
					"Error in line " + (error + 1) + ": " + lines[error] + ": " + exec[error].error,
				),
			});
		} else {
			return {
				count: exec.length,
				duration: exec.reduce((p, c) => {
					return p + c.meta.duration;
				}, 0),
			};
		}
	}
	async _send(endpoint, query, params, dothrow = true) {
		const body = JSON.stringify(
			typeof query == "object"
				? query.map((s, index) => {
						return { sql: s, params: params[index] };
				  })
				: {
						sql: query,
						params,
				  },
		);
		console.log("D1: " + body);
		const response = await this.binding.fetch(new URL(endpoint, "http://d1"), {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body,
		});
		try {
			const answer = await response.json();
			if (answer.error && dothrow) {
				const err = answer;
				console.error(err);
				throw new Error("D1_ERROR", { cause: new Error(err.error) });
			} else {
				return Array.isArray(answer)
					? answer.map((r) => mapD1Result(r))
					: mapD1Result(answer);
			}
		} catch (e) {
			console.error(e);
			throw new Error("D1_ERROR", {
				cause: new Error(e.cause || "Something went wrong"),
			});
		}
	}
}

class D1PreparedStatement {
	constructor(database, statement, values) {
		this.database = database;
		this.statement = statement;
		this.params = values || [];
	}
	bind(...values) {
		for (const r in values) {
			switch (typeof values[r]) {
				case "number":
				case "string":
					break;
				case "object":
					if (values[r] == null) break;
					if (
						Array.isArray(values[r]) &&
						values[r]
							.map((b) => {
								return typeof b == "number" && b >= 0 && b < 256 ? 1 : 0;
							})
							.indexOf(0) == -1
					)
						break;
					if (values[r] instanceof ArrayBuffer) {
						values[r] = Array.from(new Uint8Array(values[r]));
						break;
					}
					if (ArrayBuffer.isView(values[r])) {
						values[r] = Array.from(values[r]);
						break;
					}
				default:
					throw new Error("D1_TYPE_ERROR", {
						cause: new Error(
							"Type '" +
								typeof values[r] +
								"' not supported for value '" +
								values[r] +
								"'",
						),
					});
			}
		}
		return new D1PreparedStatement(this.database, this.statement, values);
	}
	async first(colName) {
		const info = firstIfArray(await this.database._send("/query", this.statement, this.params));
		const results = info.results;
		if (colName !== void 0) {
			if (results.length > 0 && results[0][colName] === void 0) {
				throw new Error("D1_COLUMN_NOTFOUND", {
					cause: new Error("Column not found"),
				});
			}
			return results.length < 1 ? null : results[0][colName];
		} else {
			return results.length < 1 ? null : results[0];
		}
	}
	async run() {
		return firstIfArray(await this.database._send("/execute", this.statement, this.params));
	}
	async all() {
		return firstIfArray(await this.database._send("/query", this.statement, this.params));
	}
	async raw() {
		const s = firstIfArray(await this.database._send("/query", this.statement, this.params));
		const raw = [];
		for (const r in s.results) {
			const entry = Object.keys(s.results[r]).map((k) => {
				return s.results[r][k];
			});
			raw.push(entry);
		}
		return raw;
	}
}
function firstIfArray(results) {
	return Array.isArray(results) ? results[0] : results;
}
function mapD1Result(result) {
	const map = {
		results: result.results || [],
		success: result.success === void 0 ? true : result.success,
		meta: result.meta || {},
	};
	result.error && (map.error = result.error);
	return map;
}
