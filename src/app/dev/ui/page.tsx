import { notFound } from "next/navigation";
import { Vitrine } from "./vitrine";

export default function Page() {
	if (process.env.NODE_ENV === "production") notFound();
	return <Vitrine />;
}
