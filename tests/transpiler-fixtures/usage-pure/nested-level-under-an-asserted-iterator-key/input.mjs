// A TypeScript assertion around an iterator key is the key it wraps: the nested level under it destructures
// the helper result of the iterator method, through an alias or straight off `Symbol`, whatever the
// assertion spells.
const it = Symbol.iterator;
const { [it as symbol]: { next } } = getList();
const { [Symbol.iterator as typeof Symbol.iterator]: { length } } = getText();
const { [it!]: { call } } = getSet();
const { [it satisfies symbol]: { bind } } = getArr();
const { [<symbol>it]: { apply } } = getMap();
export { next, length, call, bind, apply };
