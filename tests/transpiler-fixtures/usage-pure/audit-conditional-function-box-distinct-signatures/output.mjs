import _at from "@core-js/pure/actual/instance/at";
// Callable boxes do not retain parameter signatures, so their shared family cannot prove equality.
// The conditional stays undecided and pure keeps generic dispatch; TypeScript selects string.
type Sel<T> = T extends Array<() => void> ? number[] : string;
declare const v: Array<(n: number) => void>;
declare const r: Sel<typeof v>;
_at(r).call(r, 0);