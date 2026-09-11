import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// `o?.a` short-circuits to undefined (no throw) when o is null, so `??` may yield the
// string fallback: usage-global injects the union (es.array.at + es.string.at)
declare const o: {
  a: number[];
} | null;
(o?.a ?? 'fallback').at(0);