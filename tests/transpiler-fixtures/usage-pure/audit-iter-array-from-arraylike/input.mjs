// non-emission lock: `Array.from(arrayLike)` stays raw in pure mode; only the static
// helper is anchored, the iteration-protocol fallthrough requires an `Iterator.from`
// anchor and is intentionally not auto-emitted.
Array.from({length: 3, 0: 'a', 1: 'b', 2: 'c'});
