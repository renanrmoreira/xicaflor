import type { MetadataRoute } from "next";
import { SITE } from "@/lib/loja";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: [
				"/admin",
				"/api",
				"/conta",
				"/checkout",
				"/pedido",
				"/entrar",
				"/busca",
			],
		},
		sitemap: `${SITE}/sitemap.xml`,
	};
}
