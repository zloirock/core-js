// the catch receiver extraction fires only when a pattern prop will actually be
// rewritten; everything else destructures in place
// a non-polyfillable name stays in place even when the body references it
try { f1(); } catch ({ message }) { use(message.at(0)); }
// a polyfillable key referenced in the body extracts (`flatMap = dispatcher(_ref)`)
try { f2(); } catch ({ flatMap }) { use(flatMap); }
// a polyfillable key with NO body reference stays in place
try { f3(); } catch ({ findLast }) { use(2); }
// a plain default stays in place; a default on a polyfillable key extracts
try { f4(); } catch ({ code = 1 }) { use(code); }
try { f5(); } catch ({ entries = fb }) { use(entries); }
// rest alone stays in place; rest beside a polyfillable sibling extracts (sentinel)
try { f6(); } catch ({ reason, ...restA }) { use(restA); }
try { f7(); } catch ({ toSorted, ...restB }) { use(restB); }
// a nested pattern's leaf is a local binding, not a polyfill candidate - stays in place
try { f8(); } catch ({ data: { at } }) { use(at); }
