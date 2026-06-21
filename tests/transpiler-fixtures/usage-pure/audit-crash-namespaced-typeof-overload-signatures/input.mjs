// `typeof NS.fn` namespaced type-query where the function has OVERLOAD signatures (no impl body).
// resolution must collect the ambient signatures and recover each to a real NodePath (a synthetic
// shape would abort the transform). `at`/`includes` exist on both Array and String, so the
// array-specific imports confirm `ReturnType<typeof NS.fn>` resolved to `number[]`. regression lock
namespace NS { export function fn(x: number): number[]; export function fn(x: string): number[]; }
type T = ReturnType<typeof NS.fn>;
const v: T = [1, 2, 3];
v.at(0);
v.includes(2);
