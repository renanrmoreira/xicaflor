export function Esqueleto({ className = "" }: { className?: string }) {
	return <div aria-hidden className={`esqueleto ${className}`} />;
}
