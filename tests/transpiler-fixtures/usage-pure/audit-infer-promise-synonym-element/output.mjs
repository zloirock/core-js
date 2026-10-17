import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// An `infer U` element pattern over a Promise SYNONYM (`PromiseLike` / `Thenable`) must unwrap
// the same as `Promise<infer U>`: the container-family guard has to fold the synonym names to
// `Promise` too, so `U` binds to the awaited element and the array receiver / array helper is
// emitted. Without the fold the pattern takes the false branch and a string helper emits instead.
type Unwrap<P> = P extends PromiseLike<infer U> ? U : never;
type UnwrapT<P> = P extends Thenable<infer U> ? U : never;
interface Thenable<T> {
  then(cb: (value: T) => unknown): unknown;
}
declare const a: Unwrap<Promise<number[]>>;
declare const b: UnwrapT<Promise<string[]>>;
_atMaybeArray(a).call(a, 0);
_flatMaybeArray(b).call(b);