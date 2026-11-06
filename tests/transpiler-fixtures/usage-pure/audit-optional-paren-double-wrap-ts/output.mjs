import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Parentheses and erased TS wrappers preserve the adjacent-read receiver contract.
// Wrapping a bare identifier adds no runtime effect and requires no receiver capture.
const a = null == (((arr) as any)) ? void 0 : _at((((arr) as any)))?.call((((arr) as any)), 0);
const b = null == ((arr! as any)) ? void 0 : _flatMaybeArray(((arr! as any)))?.call(((arr! as any)));
const c = null == (((arr as any) as any)) ? void 0 : _includes((((arr as any) as any)))?.call((((arr as any) as any)), 'x');
export { a, b, c };