// usage-pure: the use and the reassignment share a loop body - on the second iteration K is 'of'
// (set by the first), so a textually-later write reaches the use via the back-edge. pure bails (no
// `_Array$from`); the after-use proof only holds when the read runs at most once.
let K = "from";
for (let i = 0; i < 2; i++) {
  Array[K]([1, 2, 3]);
  K = "of";
}
