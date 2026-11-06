import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `ReturnType<Fn>` over a function-type ALIAS extracts a bare parameter ref, so it has to resolve
// in the caller's instantiation context like every sibling utility arm - resolved on its own it
// re-binds by NAME and answers with whatever same-named parameter's declared default is in scope,
// which is a foreign family. the second row carries the same default WITHOUT the alias hop: it is
// the control for that hop - reverting it alone leaves this row narrowed - and a lock in its own
// right, because reading a type-parameter's default has to lose to the supplied argument too
type Fn<T> = () => T;
type ThroughAlias<T = number[]> = ReturnType<Fn<T>>;
declare const viaAlias: ThroughAlias<string>;
export const a = _atMaybeString(viaAlias).call(viaAlias, 0);
type Direct<T = number[]> = T;
declare const viaDirect: Direct<string>;
export const b = _atMaybeString(viaDirect).call(viaDirect, 0);