// mixed export: `foo` is a runtime value (passes through), `Map` is a type-only export
// with the `type` modifier - polyfill skipped because the binding never reaches runtime
const foo = 1;
type Map = never;
export { foo, type Map };
