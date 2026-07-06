// `T[keyof T]` over an interface of methods resolves to the method VALUE type (a function),
// not each method's return type - the union folds to Function exactly like the single-key
// `T['method']` mirror, and a Function value has no `at`, so no instance helper is injected
// at all (the native call throws identically on every engine)
interface T { a(): number[]; b(): number[]; }
declare const v: T[keyof T];
const r = v.at(0);
export { r };
