// a computed-key write with a non-string/number-literal key (`o[true]`) is a DYNAMIC
// (unenumerable) write that leaks the binding, so the `o.m` array narrow can't be trusted and
// `o.m.at(0)` keeps the generic instance `.at`. before the fix oxc admitted the boolean Literal
// as a static key (no leak -> array-specific `.at`), diverging from babel; both now agree.
const o = { m: [1, 2, 3] };
o[true] = 1;
o.m.at(0);
