// Adjacent computed static keys retain key1, binding1, key2, binding2 order.
// Both effects run once and both bindings receive their selected pure statics.
const { [(eff1(), 'from')]: f, [(eff2(), 'of')]: g } = Array;
const doubled = [1, [2]].flat();
