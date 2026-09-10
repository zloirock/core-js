// A key-first container has no slot for either written parameter: this layer holds one element and
// `Map` keys off the first. What is left is the absence a BARE `Map` has - which means
// `Map<any, any>` and matches anything - so two Maps over different keys read as one type and take
// the TRUE branch tsc answers FALSE.
interface Wanted { wanted: string }
interface Other { other: number }
type Sel<T> = T extends Map<Other, number> ? number[] : string;
declare const v: Map<Wanted, number>;
declare const r: Sel<typeof v>;
r.at(0);
