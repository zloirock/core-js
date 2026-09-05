// A multi-hop `const` alias captures its source's value - a receiver global or a computed-key string -
// at the intermediate declarator. A reassignment of the source AFTER that read cannot change what the
// alias already holds, so usage-global must inject the CAPTURED value's polyfill: the reassignment-
// dominance is anchored per hop at each read site, not at the eventual use. The reassignment targets
// add no polyfill of their own (the `Object` global / a plain string / null), so each captured static -
// `Array.from` for the receiver hop, `Array.of` for the key hop, `Object.fromEntries` for the closure
// hop - surfaces alone.
let sourceReceiver = Array;
const aliasedReceiver = sourceReceiver;
sourceReceiver = Object;
export const a = aliasedReceiver.from([1]);

let sourceKey = "of";
const aliasedKey = sourceKey;
sourceKey = "values";
export const b = Array[aliasedKey](1, 2);

// the use sits in a CLOSURE whose var-scope owner differs from the outer read site, yet the per-hop
// anchor still pins the dominance at the read site so the later reassignment cannot reach the capture.
let closureSource = Object;
const aliasedInClosure = closureSource;
closureSource = null;
export const c = () => aliasedInClosure.fromEntries([]);
