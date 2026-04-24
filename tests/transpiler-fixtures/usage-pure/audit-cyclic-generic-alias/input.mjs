// self-wrapping generic alias `Rec<T> = Rec<T[]>` - type unresolvable. without cycle
// guard in the type resolver, each re-entry substitutes T -> T[] -> T[][] ... until the
// depth cap, burning CPU for no useful result. polyfill falls back to the generic
// instance form when type resolution returns null
type Rec<T> = Rec<T[]>;
function at(r: Rec<string>) {
  return r.at(0);
}
