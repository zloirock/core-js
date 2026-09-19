// named import shadows a global (`import { Array } from ...`): runtime references to
// `Array` resolve to the imported binding and skip polyfill emission.
import { Array } from 'custom-lib';
Array.from([1, 2, 3]);