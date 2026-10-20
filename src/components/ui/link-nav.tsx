"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

export function LinkNav({
	href,
	...props
}: ComponentProps<typeof Link> & { href: string }) {
	const caminho = usePathname();
	const atual =
		caminho === href || (href !== "/admin" && caminho.startsWith(`${href}/`));
	return (
		<Link href={href} aria-current={atual ? "page" : undefined} {...props} />
	);
}
