// TS `as const` is a runtime no-op, so `('from' as const) in Array` polyfills
// `Array.from`/related as if the LHS were a bare string.
('from' as const) in Array;
