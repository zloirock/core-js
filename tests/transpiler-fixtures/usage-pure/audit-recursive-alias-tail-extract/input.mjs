// recursive type aliases must terminate via cycle-set bail without spinning out of
// applyAliasSubstDeep depth; precision falls back to the general method dispatch
type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;
type Last<T extends any[]> = T extends [] ? never : T extends [any] ? T[0] : Last<Tail<T>>;
type Items = [string[], number[], boolean[]];
declare const last: Last<Items>;
last.includes(true);
