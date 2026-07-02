// generic outer fn returning a TSConstructorType (`new (m: Map<T, string>) => string[]`)
// whose constructor-param references the outer type param T. reference-detection must walk
// TSConstructorType params the same way it walks TSFunctionType params, otherwise outer-fn
// subst skips the inner signature when T flows into a constructor param-position wrapper
function wrap<T>(x: T): new (m: Map<T, string>) => string[] { return null as any; }
const Ctor = wrap('a');
const result = new Ctor(new Map());
result.at(0);
