// this method's own output re-fed to the plugin: a library published pre-polyfilled against
// @core-js/pure carries a computed key bound to an imported well-known symbol. that key folds back
// to its source spelling, so a second pass must classify it exactly as the first one did - reach
// the anchor route through it and the emitter is asked to spell `Symbol.asyncIterator` after a dot.
// the second row crosses the guarded-nav receiver, whose anchor is spelled on its own render path
import _Symbol$asyncIterator from '@core-js/pure/actual/symbol/async-iterator';
import _globalThis from '@core-js/pure/actual/global-this';
const { [_Symbol$asyncIterator]: { name: asyncName } } = _globalThis;
const { [_Symbol$asyncIterator]: { flat } } = _globalThis.window?.self;
console.log(asyncName, flat);
