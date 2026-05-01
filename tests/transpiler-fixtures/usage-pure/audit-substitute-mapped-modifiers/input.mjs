// Mapped passthrough with modifiers: -readonly +? — modifiers don't change member set.
// substituteTypeParams TSMappedType branch (line 2858) calls unwrapMappedTypePassthrough
// which doesn't reject `-readonly`/`+?` but DOES reject `nameType` (key remap).
// Subst should descend into the body T[K] and resolve to concrete type.
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
declare function probe<T>(arg: T): Mutable<T>;
const r = probe<{ data: number[] }>(null!);
r.data.at(0);
