// A defaulted computed-key assignment evaluates its receiver before the key.
// The fallback runs only when the single method read returns undefined.
let m;
({ [(eff(), 'flat')]: m = [] } = arr);
