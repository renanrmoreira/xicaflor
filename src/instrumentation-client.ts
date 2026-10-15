import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry";

Sentry.init({
	...sentryOptions,
	environment: location.hostname.startsWith("pr-") ? "preview" : "production",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
