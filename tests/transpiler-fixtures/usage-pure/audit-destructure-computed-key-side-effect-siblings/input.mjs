// a polyfillable side-effecting computed key (`[(eff(), 'from')]`) FLANKED by sibling computed keys
// whose prefixes also have side effects, on both sides. the effect can't be lifted out - it must run in
// source order between the siblings' effects - so the key stays in the residual pattern with its value
// renamed to a throwaway, and the polyfill is extracted to a separate `const f = _Array$from`. both
// plugins emit identically: order before(), eff(), after() preserved, siblings x/y bound, polyfill wins
const { [(before(), 'x')]: x, [(effectful(), 'from')]: f, [(after(), 'y')]: y } = Array;
const doubled = [1, [2]].flat();
