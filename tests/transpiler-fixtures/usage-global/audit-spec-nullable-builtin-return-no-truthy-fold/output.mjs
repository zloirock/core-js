import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find";
import "core-js/modules/es.string.at";
// `Array#find` returns `element | undefined` per spec, so `??` may yield the string
// fallback: usage-global injects the union of both operand shapes for `.at`
// (es.array.at + es.string.at) on top of the receiver's es.array.find
declare const a: number[][];
(a.find(v => v.length > 0) ?? 'fallback').at(0);