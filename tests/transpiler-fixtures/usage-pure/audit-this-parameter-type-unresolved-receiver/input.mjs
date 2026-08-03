// `ThisParameterType<typeof fn>` answers Object only when the function declares NO `this` param.
// an explicit `this` whose annotation does not resolve is a different answer - unknown, which has
// to reach the generic dispatch; an Object masquerade over it suppresses the polyfill entirely
import type { Opaque } from "./opaque";
declare function withOpaqueThis(this: Opaque): void;
declare const opaque: ThisParameterType<typeof withOpaqueThis>;
export const first = opaque.at(0);

declare function withArrayThis(this: number[]): void;
declare const known: ThisParameterType<typeof withArrayThis>;
export const last = known.findLast(x => x);

declare function withoutThis(): void;
declare const none: ThisParameterType<typeof withoutThis>;
export const kept = none;
