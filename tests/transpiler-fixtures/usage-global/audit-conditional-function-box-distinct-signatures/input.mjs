// Callable boxes do not retain parameter signatures, so their shared family cannot prove equality.
// The conditional stays undecided and global injects both at families; TypeScript selects string.
type Sel<T> = T extends Array<() => void> ? number[] : string;
declare const v: Array<(n: number) => void>;
declare const r: Sel<typeof v>;
r.at(0);
