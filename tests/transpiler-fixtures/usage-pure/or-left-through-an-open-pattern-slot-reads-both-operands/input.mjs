// a `||` / `??` or a presence test whose left reads a name a pattern binds to a slot holding no one certain
// value - one a write replaced or a call it escapes to may replace, one a spread may shift, one of a
// container a write may replace, and an alias of such a name - decides nothing: the slot may hold a falsy
// value, so the right is read too. a slot captured before its write, and one nothing writes, decide
const box = { C: Map };
box.C = null;
const { C: M } = box;
export const grouped = (M || Object).groupBy;
const held = { C: Set };
clobber(held);
const { C: S } = held;
export const built = (S ?? Object).fromEntries;
const slots = [WeakMap];
slots[0] = null;
const [W] = slots;
export const owns = (typeof W == 'function' ? W : Object).hasOwn;
const [, P] = [...extra, Promise];
export const listed = (P || Object).values;
let pair = { C: WeakSet };
if (flag) pair = { C: null };
const { C: Q } = pair;
export const pairs = (Q || Object).entries;
const N = M;
export const described = (N || Object).getOwnPropertyDescriptors;
const late = { C: Map };
const { C: L } = late;
late.C = null;
export const merged = (L || Object).assign;
const plain = { C: Set };
const { C: K } = plain;
export const same = (K || Object).is;
