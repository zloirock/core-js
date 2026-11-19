// The consumed assignment keeps its receiver and runs each key before its write.
let of, from, rest;
const held = ({ [(log(typeof of), 'of')]: of, from, ...rest } = get());
function get() { log('receiver'); return Array; }
use(held, of(1), from([2]), rest);
