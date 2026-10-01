// The boxed top accepts every non-nullish type, an unmodelled interface included, so this decides
// its TRUE branch. `Object` spells itself constructor-null where the box every unmodelled shape
// resolves to names a constructor, and the marker telling the two apart is stamped where BOTH
// resolution lanes reach a container - so the substituting one below decides it too.
interface Wanted { wanted: string }
type Sel<T> = T extends Array<Object> ? number[] : string;
declare const v: Array<Wanted>;
declare const r: Sel<typeof v>;
r.at(0);
