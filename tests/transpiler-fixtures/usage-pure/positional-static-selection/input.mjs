// A static reached through a call keeps the call, iteration and native read before binding.
// An optional call still performs its native selection, including its nullish failure.
const make = () => [Object, 7];
let keys, tail;
([{ keys }, tail] = make());
const build = () => [Array];
const [{ of }] = build?.();
use(keys, tail, of);
