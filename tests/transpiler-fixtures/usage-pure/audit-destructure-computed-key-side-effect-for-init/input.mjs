// a side-effecting computed key in a FOR-INIT declarator. the loop header can't host a preceding
// statement, so the polyfill binds as a SIBLING declarator (`..., from = _Array$from`) and the key
// stays in the residual with its value renamed. effect runs once, polyfill ALWAYS wins. regression: the
// old inline default `= _Array$from` read the native on engines that have a (possibly buggy) Array.from
for (const { [(effectful(), 'from')]: from } = Array; cond;) use(from);
