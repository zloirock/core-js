// pathological `(delete x.k) in y` - delete returns boolean, `boolean in y` is a runtime
// TypeError unless y is the right shape, but the syntactic shape passes parser. plugin
// doesn't recognize `boolean in y` as a polyfill candidate (LHS isn't a known key shape),
// no inject. covers the LHS-as-non-string-key case
(delete x.k) in y;
