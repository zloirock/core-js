// an optional property (`a?: T`) admits undefined even on a present receiver, so `??`
// may yield the string fallback: the member type is marked and must dispatch
// generically, not through an array-Maybe
interface I { a?: number[] }
declare const i: I;
(i.a ?? 'fallback').at(0);
