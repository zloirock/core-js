// a static-call result (`Array.from(...)`) feeding a chained instance method, assigned to a
// LOOP-REASSIGNED binding: the receiver is memoized into `_ref`, and the moved receiver must
// still be re-visited so its static polyfill is injected, not left native (regression: babel@8
// re-keys cached ancestor paths lazily after the memo's `var _ref` insert, which once tripped
// the orphan guard and dropped the `Array.from` polyfill)
let p;
for (const _ of [0]) p = Array.from([3, [1, 2]]).with(0, 9);
export { p };
