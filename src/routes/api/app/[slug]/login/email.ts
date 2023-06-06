export default ({
	head,
	body,
	link,
	login,
	color,
}: {
	head: string;
	body: string;
	link: string;
	login: string;
	color: string;
}) => `
<head>
	<meta name="x-apple-disable-message-reformatting" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
	<meta name="color-scheme" content="light dark" />
	<meta name="supported-color-schemes" content="light dark" />

	<style>
		td {
			white-space: nowrap;
			padding: 1rem;
			vertical-align: middle;
		}
		tbody,
		tfoot :where(tr:not(:last-child) :where(th, td)) {
			border-bottom-width: 1px;
			--tw-border-opacity: 1;
			border-color: hsl(var(--b2, var(--b1)) / var(--tw-border-opacity));
		}
		tfoot :where(th, td) {
			--tw-bg-opacity: 1;
			background-color: hsl(var(--b2, var(--b1)) / var(--tw-bg-opacity));
			font-size: 0.75rem;
			line-height: 1rem;
			font-weight: 700;
			text-transform: uppercase;
		}
		.table :where(tbody th, tbody td) {
			--tw-bg-opacity: 1;
			background-color: hsl(var(--b1) / var(--tw-bg-opacity));
		}
		td:first-child {
			border-top-left-radius: 0.5rem;
		}
		td:last-child {
			border-top-right-radius: 0.5rem;
		}
		td:first-child {
			border-bottom-left-radius: 0.5rem;
		}
		td:last-child {
			border-bottom-right-radius: 0.5rem;
		}
		:root {
			color-scheme: light dark;
		}
		@media (max-width: 600px) {
			.sm-w-full {
				width: 100% !important;
			}
			.sm-px-6 {
				padding-left: 24px !important;
				padding-right: 24px !important;
			}
			.sm-py-8 {
				padding-top: 32px !important;
				padding-bottom: 32px !important;
			}
			.sm-leading-8 {
				line-height: 32px !important;
			}
		}
	</style>
</head>
<body
	style="
		-webkit-font-smoothing: antialiased;
		word-break: break-word;
		margin: 0;
		width: 100%;
		background-color: #f8fafc;
		padding: 0;
	"
>
	<div role="article" aria-roledescription="email" lang="en">
		<table
			style="
				width: 100%;
				font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
			"
			cellpadding="0"
			cellspacing="0"
			role="presentation"
		>
			<tr>
				<td align="center" style="background-color: #f8fafc">
					<table
						class="sm-w-full"
						style="width: 600px"
						cellpadding="0"
						cellspacing="0"
						role="presentation"
					>
						<tr>
							<td align="center" class="sm-px-6">
								<table
									style="width: 100%"
									cellpadding="0"
									cellspacing="0"
									role="presentation"
								>
									<tr role="separator">
										<td style="height: 24px"></td>
									</tr>
									<tr>
										<td
											class="sm-px-6"
											style="
												border-radius: 4px;
												background-color: #fff;
												padding: 48px;
												text-align: left;
												font-size: 16px;
												line-height: 24px;
												color: hsl(var(--bc));
												box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
											"
										>
											<p
												class="sm-leading-8"
												style="
													margin: 0;
													margin-bottom: 24px;
													font-size: 24px;
													font-weight: 600;
													color: hsl(var(--bc));
												"
											>
												${head}
											</p>
											<p style="margin: 0; margin-bottom: 24px">
												${body}
											</p>
											<div style="line-height: 100%">
												<a
													href="${link}"
													style="
														text-decoration: none;
														display: inline-block;
														border-radius: 4px;
														background-color: ${color};
														padding-left: 16px;
														padding-right: 16px;
														padding-top: 14px;
														padding-bottom: 14px;
														text-align: center;
														font-size: 16px;
														font-weight: 600;
														color: #fff;
														transition-property: all;
														transition-timing-function: cubic-bezier(
															0.4,
															0,
															0.2,
															1
														);
														transition-duration: 150ms;
													"
												>
													<span style="mso-text-raise: 16px">
														${login}
													</span>
												</a>
											</div>
											<p>
												<a href="${link}" style="text-decoration: none; font-size: 10px;">${link}</a>
											</p>
										</td>
									</tr>

									<tr>
										<td
											style="
												padding-left: 24px;
												padding-right: 24px;
												text-align: center;
												font-size: 12px;
												color: #475569;
											"
										>
											<p style="cursor: default">
												<a
													href="https://github.com/JacobLinCool/pea"
													target="_blank"
													rel="noreferrer"
													style="text-decoration: none; color: ${color}"
												>
													Pure Email Auth
												</a>
											</p>
										</td>
									</tr>

									<tr role="separator">
										<td style="height: 24px"></td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</div>
</body>
`;
