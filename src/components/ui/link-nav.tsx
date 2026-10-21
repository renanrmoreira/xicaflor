"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

export function LinkNav({
	href,
	tambem = [],
	...props
}: ComponentProps<typeof Link> & { href: string; tambem?: string[] }) {
	const caminho = usePathname();
	const atual =
		caminho === href ||
		tambem.includes(caminho) ||
		(href !== "/admin" && caminho.startsWith(`${href}/`));
	return (
		<Link href={href} aria-current={atual ? "page" : undefined} {...props} />
	);
}
