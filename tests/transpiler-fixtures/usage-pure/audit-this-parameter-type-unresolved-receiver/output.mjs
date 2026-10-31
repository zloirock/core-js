import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _at from "@core-js/pure/actual/instance/at";
// `ThisParameterType<typeof fn>` answers Object only when the function declares NO `this` param.
// an explicit `this` whose annotation does not resolve is a different answer - unknown, which has
// to reach the generic dispatch; an Object masquerade over it suppresses the polyfill entirely
import type { Opaque } from "./opaque";
declare function withOpaqueThis(this: Opaque): void;
declare const opaque: ThisParameterType<typeof withOpaqueThis>;
export const first = _at(opaque).call(opaque, 0);
declare function withArrayThis(this: number[]): void;
declare const known: ThisParameterType<typeof withArrayThis>;
export const last = _findLastMaybeArray(known).call(known, x => x);
declare function withoutThis(): void;
declare const none: ThisParameterType<typeof withoutThis>;
export const kept = none;