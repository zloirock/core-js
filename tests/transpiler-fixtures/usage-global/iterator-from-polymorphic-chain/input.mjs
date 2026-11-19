// Iterator.from on an Array-method chain: `arr.map(f).filter(g)` produces an Array
// (Array.prototype.map / filter polyfilled if needed), Iterator.from lifts the result
// into Iterator; subsequent .take(n).toArray() requires Iterator-helper polyfills
Iterator.from(arr.map(f).filter(g)).take(5).toArray();
