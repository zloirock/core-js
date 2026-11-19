// Reverse-ordered control: array overload first, scalar last; TS picks the last (`number`).
// `number.at` doesn't exist, so no polyfill emits and the resolver must NOT pick the first overload.
declare function fn(): string[];
declare function fn(): number;
type R = ReturnType<typeof fn>;
declare const r: R;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
r.at?.(0);
