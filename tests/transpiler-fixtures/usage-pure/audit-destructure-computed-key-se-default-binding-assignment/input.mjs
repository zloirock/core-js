// A defaulted computed-key assignment captures its receiver before evaluating the key.
// The fallback runs only when the single method read returns undefined.
let m;
({ [(eff(), 'flat')]: m = [] } = arr);
