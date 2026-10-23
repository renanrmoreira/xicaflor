import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: { serverSourceMaps: true },
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
