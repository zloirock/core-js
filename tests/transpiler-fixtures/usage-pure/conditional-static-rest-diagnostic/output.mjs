import _Iterator from "@core-js/pure/actual/iterator";
// Rest prevents replacing an undecided static read; pure debug explains that refusal.
const {
  from,
  ...rest
} = choice ? Array : _Iterator;
use(from, rest);