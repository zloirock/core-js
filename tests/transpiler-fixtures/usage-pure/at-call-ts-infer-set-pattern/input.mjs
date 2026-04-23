// `T extends Set<infer U> ? U[] : never` - Set element extraction. resolveInnerType pulls
// the `.inner` slot regardless of container, so widening the whitelist to include Set makes
// this narrow correctly
type SetElems<T> = T extends Set<infer U> ? U[] : never;
declare const r: SetElems<Set<string>>;
r.at(0);
