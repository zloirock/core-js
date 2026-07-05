// Flow `?T` admits null | undefined, so `??` may yield the string fallback:
// usage-global injects the union of both operand shapes (es.array.at + es.string.at)
declare var r: ?(number[]);
(r ?? 'fallback').at(0);
