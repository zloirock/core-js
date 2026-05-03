// User explicitly imports global core-js entry side-effect (`import 'core-js/...'`)
// inside a usage-pure file. The plugin's existing-imports scan catches this and routes
// it through the global injector. Output mixes ESM-pure-imports + global-side-effect
// imports - a potentially confusing emission shape but matches the scanner's intent.
import 'core-js/actual/array/at';
const x = arr.flat();
