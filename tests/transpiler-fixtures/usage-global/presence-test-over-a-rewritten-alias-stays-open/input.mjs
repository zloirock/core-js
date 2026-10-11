// a presence test over an alias the file writes again decides nothing where the write may reach the
// test: the alias may hold another value, null included, so both arms run - the writes and the reads
// they guard keep every value. an alias nothing writes again decides as the global it holds
export function either(value, legacy) {
  let P = Promise;
  if (legacy) P = null;
  if (!P || typeof value == 'string') return value.at(0);
}
let Impl = Promise;
Impl = options.Promise;
let Ctor = Object;
if (!Impl) Ctor = Map;
export const grouped = Ctor.groupBy([1], x => x);
let R = Reflect;
export function setR(next) {
  R = next;
}
const held = R;
export function viaAlias(value) {
  if (!held || typeof value == 'string') return value.flat();
}
const stable = Promise;
export function control(value) {
  if (!stable || typeof value == 'string') return value.slice(1);
}
