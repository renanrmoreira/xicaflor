import * as Sentry from "@sentry/nextjs";
import { EVENTO_NAVEGACAO } from "@/lib/eventos";
import { sentryOptions } from "@/lib/sentry";

Sentry.init({
	...sentryOptions,
	environment: location.hostname.startsWith("pr-") ? "preview" : "production",
});

export function onRouterTransitionStart(
	url: string,
	tipo: "push" | "replace" | "traverse",
) {
	Sentry.captureRouterTransitionStart(url, tipo);
	window.dispatchEvent(new Event(EVENTO_NAVEGACAO));
}
