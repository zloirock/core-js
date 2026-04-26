// named import shadows a global (`import { Map } from ...`): runtime references to
// `Map` resolve to the imported binding and skip pure-mode polyfill emission.
import { Array } from 'custom-lib';
Array.from([1, 2, 3]);
