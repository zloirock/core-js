// Each assignment serves its own static read and yields the original receiver.
let from, rest;
const held = ({ from, ...rest } = ({ from, ...rest } = Array));
use(held === Array, from([1]), rest);
