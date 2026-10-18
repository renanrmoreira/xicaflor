import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Public_Sans } from "next/font/google";
import { Avisos } from "@/components/ui/avisos";
import { ProgressoNavegacao } from "@/components/ui/progresso-navegacao";
import { AMARELO, SITE } from "@/lib/loja";
import "./globals.css";

const display = Big_Shoulders({
	subsets: ["latin"],
	weight: "800",
	variable: "--fonte-display",
});
const texto = Public_Sans({
	subsets: ["latin"],
	weight: ["400", "600"],
	variable: "--fonte-texto",
});

export const metadata: Metadata = {
	metadataBase: new URL(SITE),
	title: "Xica Flor — Moda Feminina",
	description:
		"Seja você o seu próprio padrão de beleza! Moda feminina e beleza em Belém/PA.",
	appleWebApp: { title: "Xica Flor", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: AMARELO };

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="pt-BR"
			className={`${display.variable} ${texto.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col">
				<ProgressoNavegacao />
				<Avisos>{children}</Avisos>
			</body>
		</html>
	);
}
