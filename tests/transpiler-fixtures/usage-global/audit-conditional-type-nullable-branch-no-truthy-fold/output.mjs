import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// an undecided conditional type may take either branch at runtime, so `??` on the call
// result may yield the string fallback: usage-global injects the union of both operand
// shapes (es.array.at + es.string.at)
declare function pick<T>(x: T): T extends string ? number[] : null;
(pick(g()) ?? 'fallback').at(0);