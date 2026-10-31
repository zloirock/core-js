// chain-combine receiver containing a proxy-global (`globalThis`): pure mode must substitute it to
// the imported binding (`_globalThis`) inside the memoized receiver, not emit raw `globalThis` (a
// ReferenceError on engines without it). the receiver subtree is left visitable so the substitution
// reaches it - the combine no longer blanket-skips the whole inner callee
globalThis.list.flat?.().includes(3);
