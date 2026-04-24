// arrow body with a static polyfill (`Array.from`) chained into an instance polyfill (`.at`)
// on the same source range - the `$` inside the generated binding name must be emitted as-is
const f = x => Array.from(x).at(0);
