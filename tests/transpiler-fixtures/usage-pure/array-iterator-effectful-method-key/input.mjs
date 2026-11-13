// Native iteration captures the element before its effectful method key is dispatched.
function key() { effect(); return "at"; }
function* values() { yield [7, 8]; }
const [{ [key()]: at }] = values();
export { at };
