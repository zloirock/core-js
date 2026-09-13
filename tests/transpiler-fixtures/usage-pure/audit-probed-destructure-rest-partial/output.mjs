import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _self from "@core-js/pure/actual/self";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
export const {
  Math: {
    trunc: viaRestDeclinedAnchor
  },
  ...viaRestRest
} = null == _globalThis.window ? void 0 : _self;
export const viaPartialProbed = _Number$isInteger;
export const {
  customZ: viaPartialCustom
} = null == _globalThis.window ? void 0 : _self.Number;