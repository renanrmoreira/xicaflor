import { withSentry } from "@sentry/nextjs/cloudflare";
// @ts-expect-error gerado pelo OpenNext no build
import handler from "./.open-next/worker.js";
import { sentryOptions } from "./src/lib/sentry";

type Env = { SENTRY_ENVIRONMENT?: string; SENTRY_RELEASE?: string };

const app = withSentry(
	(env: Env) => ({
		...sentryOptions,
		environment: env.SENTRY_ENVIRONMENT ?? "production",
		release: env.SENTRY_RELEASE,
	}),
	handler,
);

export default {
	...app,
	fetch(...[request, env, ctx]: Parameters<NonNullable<typeof app.fetch>>) {
		const url = new URL((request as Request).url);
		if (url.hostname === "www.xicaflor.com.br") {
			url.hostname = "xicaflor.com.br";
			return Response.redirect(url, 308);
		}
		return app.fetch?.(request, env, ctx);
	},
};
