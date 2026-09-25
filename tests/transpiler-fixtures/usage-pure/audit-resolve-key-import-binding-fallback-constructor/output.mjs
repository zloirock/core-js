import _Symbol from "@core-js/pure/actual/symbol";
// cross-module imported key cannot be resolved statically: `Symbol[k] in obj` does not
// flatten to is-iterable (would assume `k === 'iterator'`). the bare `Symbol` receiver takes its
// whole family on legacy targets: a key no fold names may read any of its statics
import { k } from './keys.mjs';
_Symbol[k] in obj;