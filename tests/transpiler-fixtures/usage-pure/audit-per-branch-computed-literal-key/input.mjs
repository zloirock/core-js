// static string / template-literal computed keys in a CONDITIONAL destructure receiver must synth their
// polyfill on each viable branch, not bail (the per-branch path has no body-extract fallback, so a bail
// would drop the polyfill -> ie:11 TypeError). `['from']` / [`of`] resolve to a polyfillable static and
// become `_Array$from` / `_Array$of`; the non-polyfillable `['zzz']` is preserved as `receiver['zzz']`.
// param-default keeps bailing literal keys to the safe body-extract (the gate flag is per-branch-only)
const cond = Math.random() > 0.5;
const { ['from']: a, [`of`]: b, ['zzz']: c } = cond ? Array : Set;
[a, b, c];
