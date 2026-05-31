// `typeof NS.fn` namespaced type-query where the namespaced function has OVERLOAD signatures (no
// implementation body). resolution must collect the ambient signatures and recover each to a real
// NodePath (consumers call `.get(...)`); a synthetic shape would abort the transform. `at` and
// `includes` exist on both Array and String, so the array-specific import (`_atMaybeArray` from
// array/instance, not the generic `instance/at`) confirms `ReturnType<typeof NS.fn>` resolved to
// `number[]`. distinct from the single-implementation case. both plugins. regression lock
namespace NS { export function fn(x: number): number[]; export function fn(x: string): number[]; }
type T = ReturnType<typeof NS.fn>;
const v: T = [1, 2, 3];
v.at(0);
v.includes(2);
