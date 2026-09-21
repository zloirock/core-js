// A hole-prefixed array pattern pairs its static with the correct element.
// Other elements remain intact and calls through the binding retain Array narrowing.
const [, { from }] = [Set, Array];
const arr = from([1, 2, 3]);
arr.at(0);
