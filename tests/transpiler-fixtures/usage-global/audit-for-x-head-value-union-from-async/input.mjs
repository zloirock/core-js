// a for-IN head yields string keys, and no string carries this static - the row injects NOTHING
// (isolated probe; its key is chosen to collide with no other row)
let K = Object;
for (K in { a: 1 }) { break; }
K.fromAsync([4]);
