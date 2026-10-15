import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry";

export function register() {
	Sentry.init({
		...sentryOptions,
		environment: process.env.SENTRY_ENVIRONMENT ?? "production",
	});
}

export const onRequestError = Sentry.captureRequestError;
