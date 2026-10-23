import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const SUPABASE =
	process.env.SUPABASE_URL ?? "https://ughhiqxuzhesmahhqyld.supabase.co";

const csp = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
	"style-src 'self' 'unsafe-inline'",
	`img-src 'self' data: blob: ${SUPABASE}`,
	"font-src 'self'",
	"worker-src 'self' blob:",
	`connect-src 'self' ${SUPABASE} https://viacep.com.br https://*.ingest.us.sentry.io https://cloudflareinsights.com`,
	"frame-src https://challenges.cloudflare.com",
	"frame-ancestors 'none'",
	"form-action 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{ key: "Content-Security-Policy", value: csp },
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains",
					},
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=(), payment=()",
					},
				],
			},
		];
	},
	turbopack: {
		rules: {
			"*.css": {
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css",
			},
		},
	},
};

export default withSentryConfig(nextConfig, {
	org: "renan-m-software-house",
	project: "xicaflor",
	authToken: process.env.SENTRY_AUTH_TOKEN,
	silent: !process.env.CI,
	widenClientFileUpload: true,
});

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
