import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4;
// the text emitter slices source by PARSER offsets, so anything that moves bytes, UTF-16 units and
// code points apart is a direct risk to every span the guard render computes. an astral character
// before the nav, inside a comment, in an identifier and INSIDE the rewritten region each shift a
// different one of those counts
// comment with an astral pair: 😀 𝒜
const emoji = '😀𝒜';
const 𝒜 = 'script-capital-a';
_globalThis.wideBox = {
  list: ['ab', 'cd'],
  n: 4
};
export const beforeNav = null == (_ref = null == _globalThis.window ? void 0 : _self.wideBox.list) ? void 0 : _at(_ref).call(_ref, 0);
export const afterIdent = null == _globalThis.window ? void 0 : _self.wideBox.n;
export const escapes = '\u0041\u{1F600}\n\t'.length + ((null == _globalThis.window ? void 0 : _self.wideBox.n) ?? 0);

// the astral character sits INSIDE the span the render replaces: in a computed key with an effect,
// in a template, and in a call argument
let k = 0;
export const keyWithEffect = null == (_ref2 = null == _globalThis.window ? void 0 : _self.wideBox[k++, '😀' && 'list']) ? void 0 : _at(_ref2).call(_ref2, 0);
export const templateKey = null == (_ref3 = null == _globalThis.window ? void 0 : _self.wideBox[`${'😀' && 'list'}`]) ? void 0 : _at(_ref3).call(_ref3, 0);
export const argument = null == (_ref4 = null == _globalThis.window ? void 0 : _self.wideBox.list) ? void 0 : _at(_ref4).call(_ref4, '😀'.length - 2);
export { emoji, k, 𝒜 };