// reverse-ordered control for `audit-returntype-overloaded-fn`: array overload FIRST, scalar
// overload LAST. TS picks the last -> `number`. Number has no `.at` instance method, no narrow,
// no polyfill emitted. confirms resolveReturnTypeFromTypeQuery selects last (not first) ambient
declare function fn(): string[];
declare function fn(): number;
type R = ReturnType<typeof fn>;
declare const r: R;
r.at?.(0);
