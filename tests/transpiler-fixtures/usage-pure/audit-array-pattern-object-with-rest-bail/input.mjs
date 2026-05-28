// nested object destructure with rest gather inside an array destructure element.
// emit bail: residual rendering can't currently re-wrap the outer ArrayPattern around
// the consumed-sentinel + rest residual, so semantic-preserving polyfill substitution
// isn't reachable for this shape. parity between babel-plugin and unplugin pipelines
const [{ from, ...rest }] = [Array];
from([1]);
rest;
