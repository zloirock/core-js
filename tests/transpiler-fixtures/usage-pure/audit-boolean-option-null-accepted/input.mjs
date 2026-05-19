// boolean options accept `null` symmetric to `undefined` (`isEmpty` predicate).
// build configs commonly use conditional spreads like
// `{ debug: dev ? true : null }` to clear an option without removing it - this
// fixture documents that `null` passes validation cleanly and the option-type
// error message now reflects "null, or undefined" instead of the stale
// "or undefined"-only phrasing
[1, 2, 3].at(-1);
