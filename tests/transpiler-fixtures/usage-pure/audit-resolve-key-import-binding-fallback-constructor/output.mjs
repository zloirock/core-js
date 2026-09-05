import _Symbol from "@core-js/pure/actual/symbol/constructor";
// cross-module imported key cannot be resolved statically: `Symbol[k] in obj` does not
// flatten to is-iterable (would assume `k === 'iterator'`). bare `Symbol` receiver still
// gets the constructor polyfill on legacy targets
import { k } from './keys.mjs';
_Symbol[k] in obj;