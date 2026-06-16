// An `infer U` element pattern over a Promise SYNONYM (`PromiseLike` / `Thenable`) must unwrap the
// same as `Promise<infer U>`: the check-side resolver normalizes all three container names to
// `Promise`, so the container-family guard has to fold the synonym name too. Here `T<Promise<...>>`
// matches `PromiseLike<infer U>` and binds `U` to the awaited element, so the receiver is the array
// and the array helper is emitted. Without the synonym fold the pattern wrongly takes the false
// branch (`string`) and a wrong-receiver string helper would be emitted. Distinct methods per line.
type Unwrap<P> = P extends PromiseLike<infer U> ? U : never;
type UnwrapT<P> = P extends Thenable<infer U> ? U : never;
interface Thenable<T> { then(cb: (value: T) => unknown): unknown; }
declare const a: Unwrap<Promise<number[]>>;
declare const b: UnwrapT<Promise<string[]>>;
a.at(0);
b.flat();
