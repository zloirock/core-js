// `Readonly<T>` distributes over the union, so the value may still be null at runtime; the
// readonly re-tag must QUALIFY the union-folded type (which carries the nullish-strip
// marker), not rebuild it from the identity fields - a rebuild dropped the marker and
// re-armed the truthy fold into an array-Maybe on the string fallback path
declare const r: Readonly<number[] | null>;
(r ?? 'fallback').at(0);
