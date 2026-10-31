// a static read through a key that runs code binds the static's own entry, and a later call off that
// binding narrows by the static's known return, as off a plainly keyed one - alone, with a default,
// behind another such key, and nested under a captured init
function l(t, v) { return v; }
function make() { return { w: Array, other: 1 }; }
const { [l('k', 'from')]: from } = Array;
export const last = from([1, 2]).at(-1);
const { [l('k2', 'of')]: of = null } = Array;
export const has = of(1, 2).includes(2);
const { [l('k3', 'fromAsync')]: fromAsync, [l('k4', 'from')]: from2 } = Array;
export const first = from2([3]).at(0);
const { w: { [l('k5', 'from')]: from3 }, other } = (l('s', 0), make());
export const third = from3([4]).at(0);
export { fromAsync, other };
