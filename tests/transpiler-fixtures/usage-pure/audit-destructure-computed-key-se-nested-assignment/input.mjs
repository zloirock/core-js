// A nested computed method assignment reads its receiver once before the key effect.
// The polyfill is assigned at that slot, without a second read after the pattern.
let m;
({ y: { [(eff(), 'flat')]: m } } = { y: arr });
