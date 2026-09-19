import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis3 from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self2 from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// the names the injector mints are ordinary identifiers a file may already own. composition locates
// an inner rewrite whose head the outer already resolved, and only a name the injector ACTUALLY
// minted counts as that resolution - a user identifier of the same shape is data, and treating it
// as the nav's own slot rewrote the user's expression while leaving the nav native
_globalThis3.collideBox = {
  list: ['ab', 'cd']
};
const _globalThis = {
  window: {
    self: {
      collideBox: {
        list: [9]
      }
    }
  }
};
const _globalThis2 = {
  window: {
    self: {
      collideBox: {
        list: [8]
      }
    }
  }
};
const _self = {
  collideBox: {
    list: [7]
  }
};
export const ownedHeadName = null == (_ref = (_globalThis.window?.self.collideBox.list, null == _globalThis3.window ? void 0 : _self2.collideBox.list)) ? void 0 : _at(_ref).call(_ref, 0);
export const ownedDedupName = null == (_ref2 = (_globalThis2.window?.self.collideBox.list, null == _globalThis3.window ? void 0 : _self2.collideBox.list)) ? void 0 : _at(_ref2).call(_ref2, 0);
export const ownedLeafName = null == (_ref3 = (_self.collideBox.list, null == _globalThis3.window ? void 0 : _self2.collideBox.list)) ? void 0 : _at(_ref3).call(_ref3, 0);
export const separateStatements = null == (_ref4 = ('x', _globalThis2.window?.self.collideBox.list)) ? void 0 : _at(_ref4).call(_ref4, 0);
export { _globalThis, _globalThis2, _self };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref5 = _atMaybeArray(_ref6 = ['ab', 'cd']).call(_ref6, (null == _globalThis3.window ? void 0 : _self2.collideBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref5).call(_ref5, 'a');