// boolean options accept `null` symmetric to `undefined`. build configs commonly use
// conditional spreads like `{ debug: dev ? true : null }` to clear an option without
// removing it, so `null` must pass validation cleanly; the option-type error message
// now reads "null, or undefined" instead of the stale "or undefined"-only phrasing
[1, 2, 3].at(-1);
