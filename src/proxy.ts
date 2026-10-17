import type { NextRequest } from "next/server";
import { renovarSessao } from "@/server/sessao";

export function proxy(request: NextRequest) {
	return renovarSessao(request);
}

export const config = {
	matcher: ["/admin/:path*", "/conta/:path*", "/entrar"],
};
