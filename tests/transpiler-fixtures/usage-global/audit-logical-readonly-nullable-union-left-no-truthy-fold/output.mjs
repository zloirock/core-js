import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// `Readonly<T>` distributes over the union, so the value may still be null at runtime and
// `??` may yield the string fallback: the readonly re-tag must not drop the nullish-strip
// marker - usage-global injects the union of both operand shapes (es.array.at + es.string.at)
declare const r: Readonly<number[] | null>;
(r ?? 'fallback').at(0);