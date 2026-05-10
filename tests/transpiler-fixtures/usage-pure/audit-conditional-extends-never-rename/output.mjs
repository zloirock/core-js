import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `T extends never ? A : B` - never is the bottom type per TS spec; nothing extends it
// (except never itself). pickConditionalBranch picks falseBranch deterministically for
// any non-never check side via dedicated rule (`extend.type === 'never' && check.type !==
// 'never' -> return false`). without this rule, heterogeneous fold over Promise vs Array
// branches would collapse to commonType (Object) and lose the Array hint. with the rule,
// resolver walks falseBranch = T = number[] and narrow Array dispatch fires
type Wrap<T> = T extends never ? Promise<unknown> : T;
declare const r: Wrap<number[]>;
_atMaybeArray(r).call(r, 0);
_includesMaybeArray(r).call(r, 1);