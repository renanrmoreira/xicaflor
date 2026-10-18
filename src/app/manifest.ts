import type { MetadataRoute } from "next";
import { AMARELO, SLOGAN } from "@/lib/loja";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Xica Flor — Moda Feminina",
		short_name: "Xica Flor",
		description: SLOGAN,
		start_url: "/",
		display: "standalone",
		background_color: AMARELO,
		theme_color: AMARELO,
		lang: "pt-BR",
		icons: [
			{ src: "/icone-192.png", sizes: "192x192", type: "image/png" },
			{ src: "/icone-512.png", sizes: "512x512", type: "image/png" },
			{
				src: "/icone-maskable-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
