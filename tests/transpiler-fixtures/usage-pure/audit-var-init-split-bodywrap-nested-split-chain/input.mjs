// split-emitted destructure init (`xs.flat(...)`) whose body-wrap arg hosts a NESTED split chain
// (`ys.flat(z).at(0)`): the outer split resolves by logical range, the body-wrap stays queued to
// compose, and the inner split + chain fold inside it - all three behaviors exercised at once
const { includes } = xs.flat(h(() => ys.flat(z).at(0)));
includes("x");
