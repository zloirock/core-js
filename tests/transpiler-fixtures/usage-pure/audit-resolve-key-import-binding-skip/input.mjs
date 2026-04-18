// cross-module imported key cannot be resolved statically; safety guard - no polyfill.
// if this ever flips to polyfilling, plugin would silently assume `k === 'iterator'`
import { k } from './keys.mjs';
Symbol[k] in obj;
