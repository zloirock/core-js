// A live element default stays on its iterator position before the method read.
function key() { effect(); return "at"; }
function* values() { yield undefined; }
const [{ [key()]: at } = [7, 8]] = values();
export { at };
