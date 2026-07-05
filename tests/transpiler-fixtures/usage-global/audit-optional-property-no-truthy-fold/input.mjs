// an optional property (`a?: T`) admits undefined even on a present receiver, so `??`
// may yield the string fallback: usage-global injects the union (es.array.at + es.string.at)
interface I { a?: number[] }
declare const i: I;
(i.a ?? 'fallback').at(0);
