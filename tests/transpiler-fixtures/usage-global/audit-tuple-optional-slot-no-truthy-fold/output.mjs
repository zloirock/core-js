import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// a tuple optional slot (`[T?]`) admits undefined, so `??` may yield the string fallback:
// usage-global injects the union of both operand shapes (es.array.at + es.string.at)
declare const t: [number[]?];
(t[0] ?? 'fallback').at(0);