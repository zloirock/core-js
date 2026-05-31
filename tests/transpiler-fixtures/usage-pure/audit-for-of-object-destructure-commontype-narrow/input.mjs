// for-of object-destructuring: every element folds to a common array shape, so `items` is the array
// and `items.includes()` gets the array-specific polyfill. `includes` (Array AND String) makes the
// fold observable - a bail to unknown would emit the generic instance `includes`. regression lock for
// the commonType element fold.
for (const { items } of [{ items: [1, 2] }, { items: [3, 4] }]) {
  items.includes(1);
}
