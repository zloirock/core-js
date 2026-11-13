// A nested iterator position owns the method receiver and keeps the key once.
function key() { effect(); return "at"; }
function* values() { yield [[7, 8]]; }
const [[{ [key()]: at }]] = values();
export { at };
