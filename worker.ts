import { withSentry } from "@sentry/nextjs/cloudflare";
// @ts-expect-error gerado pelo OpenNext no build
import handler from "./.open-next/worker.js";
import { sentryOptions } from "./src/lib/sentry";

export default withSentry(
	(env: { SENTRY_ENVIRONMENT?: string }) => ({
		...sentryOptions,
		environment: env.SENTRY_ENVIRONMENT ?? "production",
	}),
	handler,
);
