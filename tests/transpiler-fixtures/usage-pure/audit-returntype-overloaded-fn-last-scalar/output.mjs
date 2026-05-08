// Reverse-ordered control: array overload first, scalar last; TS picks the last (`number`).
// `number.at` doesn't exist, so no polyfill emits and the resolver must NOT pick the first overload.
declare function fn(): string[];
declare function fn(): number;
type R = ReturnType<typeof fn>;
declare const r: R;
r.at?.(0);