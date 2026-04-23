// `T extends Iterable<infer U> ? U[] : never` - Iterable element extraction via the
// widened INFER_CONTAINERS whitelist. checkType's inner flows uniformly through
// `resolveInnerType` regardless of which container the pattern matched
type Iter<T> = T extends Iterable<infer U> ? U[] : never;
declare const r: Iter<Set<number>>;
r.at(0);
