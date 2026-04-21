// `'Symbol.iterator' in Array` — left is a STRING LITERAL that happens to spell the
// well-known symbol name, not a reference to `Symbol.iterator`. `isSymbolSourcedKey`
// rejects string-sourced keys so the symbol-in short-circuit skips, and Array has no
// static property with the literal string key `'Symbol.iterator'` — no polyfill emitted.
// semantically `'Symbol.iterator' in Array === false` always, which the untransformed
// expression reflects faithfully (whereas `_isIterable(Array)` would be semantically
// conflated: it asks whether Array is iterable, a different question)
'Symbol.iterator' in Array;