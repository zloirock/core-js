// An omitted first position keeps the effectful claim on the second yielded receiver.
function key() { effect(); return "includes"; }
function* values() { yield 0; yield "ab"; }
const [, { [key()]: includes }] = values();
export { includes };
