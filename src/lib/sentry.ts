export const sentryOptions = {
	dsn: "https://72f8d0000e614d4e66837be7a8de2e60@o4512260699062272.ingest.us.sentry.io/4512261498863616",
	enabled: process.env.NODE_ENV === "production",
	tracesSampleRate: 0.2,
	sendDefaultPii: false,
};
