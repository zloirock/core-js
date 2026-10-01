// for-in / for-of head bound to a bare global identifier reads + writes that global binding,
// so usage-global must inject its constructor polyfill (else the global is undefined on IE 11).
// a destructuring-pattern head is unaffected - its inner identifiers resolve through the pattern
for (Map of []) {}
for (Set in {}) {}
