import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// function-type's own `<T>` typeParameters shadow the outer alias's T; outer subst must
// NOT capture inner-bound T inside the function signature's params and return slot
type Outer<T> = { run: <T>(x: T[]) => T[] };
declare const o: Outer<number>;
const r = o.run([1, 2, 3]);
_atMaybeArray(r).call(r, 0);