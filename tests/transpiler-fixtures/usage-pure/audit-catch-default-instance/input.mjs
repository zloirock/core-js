// catch destructure default `{ includes = alt }`: the polyfill call result is captured
// once into a hoisted temporary, then defaulted - prevents double evaluation of the
// instance helper if the default expression itself has side effects
try {
  risky();
} catch ({ includes = alt }) {
  includes;
}
