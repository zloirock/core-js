// TS inline type-only export `export { type Set }` must not trigger a polyfill -
// the `type` modifier strips the runtime binding, so rewriting it produces invalid TS
type Set = string;
export { type Set };