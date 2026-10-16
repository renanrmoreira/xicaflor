"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Botao } from "./botao";

export function BotaoEnviar(props: ComponentProps<typeof Botao>) {
	const { pending } = useFormStatus();
	return <Botao type="submit" pendente={pending} {...props} />;
}
