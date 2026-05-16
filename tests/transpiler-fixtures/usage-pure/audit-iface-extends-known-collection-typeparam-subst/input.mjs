// interface generic forwards its type param to a known-collection parent (`Array<T>`).
// destructuring through a pattern-level annotation (`const [first]: MyArr<string> = ...`)
// goes via `resolveElementType` -> `resolveUserTypeElement`, which walks the parent ref
// without `resolveUserDefinedType`'s fallback path. without substituting the caller's
// usage args into the parent ref, `Array<T>` keeps `T` unbound and element resolution
// bails to generic `at`. with subst, `Array<T>` becomes `Array<string>` and `.at(0)`
// dispatches the string-specific helper.
interface MyArr<T> extends Array<T> {}
declare const x: any;
const [first]: MyArr<string> = x;
first.at(0);
