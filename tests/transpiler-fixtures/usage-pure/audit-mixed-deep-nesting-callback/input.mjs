// deeply nested callback expressions mixing polyfilled built-ins: each nested call
// site is rewritten independently with the right polyfill alias.
Array.from(arr.filter(x => x.includes(1)));
