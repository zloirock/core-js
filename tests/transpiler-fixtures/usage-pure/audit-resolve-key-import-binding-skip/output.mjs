import _Symbol from "@core-js/pure/actual/symbol/constructor";
// cross-module imported key cannot be resolved statically; safety guard - no polyfill.
// if this ever flips to polyfilling, plugin would silently assume `k === 'iterator'`
import { k } from './keys.mjs';
_Symbol[k] in obj;