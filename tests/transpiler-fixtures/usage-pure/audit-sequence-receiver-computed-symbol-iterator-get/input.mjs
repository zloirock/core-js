// no-arg Symbol.iterator get-iterator with a comma-sequence receiver AND a side-effectful
// computed key. native evaluates the receiver before the key, so `first()` and `second()`
// (receiver) precede `third()` (key), each exactly once - the receiver is selected
// before the key effects and iterator consumption.
const it = (first(), second(), arr)[Symbol[(third(), 'iterator')]]();
