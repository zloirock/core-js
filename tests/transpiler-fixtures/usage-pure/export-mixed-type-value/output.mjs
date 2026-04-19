// mixed export: `foo` is a real value (pass through), `Map` is a type-only export
// with `type` modifier (must skip polyfill). the fix must not over-trigger on `foo`
const foo = 1;
type Map = never;
export { foo, type Map };