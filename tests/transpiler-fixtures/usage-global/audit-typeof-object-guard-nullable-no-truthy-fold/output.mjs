import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// `typeof r === 'object'` keeps null at runtime, so `??` inside the branch may yield the
// string fallback: usage-global injects the union (es.array.at + es.string.at), not the
// Array-only set the unmarked guard narrow would produce
declare const r: number[] | null;
if (typeof r === 'object') {
  (r ?? 'fallback').at(0);
}