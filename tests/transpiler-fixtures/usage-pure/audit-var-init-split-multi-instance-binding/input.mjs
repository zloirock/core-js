// split-emitted init (`xs.flat(ys)`) feeding TWO instance-method bindings (`includes`, `at`): the
// split resolves once by logical range into a shared memo, then each binding wraps that memo -
// distinct from the single-binding inline path
const { includes, at } = xs.flat(ys);
includes("x");
at(0);
