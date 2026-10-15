import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Xica Flor — Moda Feminina",
	description:
		"Seja você o seu próprio padrão de beleza! Moda feminina e beleza em Belém/PA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="pt-BR" className="h-full antialiased">
			<body className="flex min-h-full flex-col">{children}</body>
		</html>
	);
}
