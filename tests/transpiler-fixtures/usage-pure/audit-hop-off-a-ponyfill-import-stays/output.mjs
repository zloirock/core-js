// a hop read off a proxy-global PONYFILL import is not ours to fold. this is the text a guard render
// produces, and re-running over it - a pre+post pipeline, a second plugin pass - hands it back as
// SOURCE, where no per-pass registry remembers that the render kept that hop on purpose. folded, the
// read stops throwing on a host without the hop: `_self.window.X` throws there, `_self.X` answers
// undefined. a user's own import of the same entry reads exactly the same way, which is why the
// verdict is asked of the SHAPE
import _self from "@core-js/pure/actual/self";
import _globalThis from "@core-js/pure/actual/global-this";
let out;
out = null == _globalThis.window ? void 0 : _self.window.noSuchStatic;
export const {
  trunc
} = null == _globalThis.window ? void 0 : _self.window.noSuchStatic.Math;
export const read = out;