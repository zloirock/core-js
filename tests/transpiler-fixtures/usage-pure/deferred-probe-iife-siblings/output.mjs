import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Both keys are served through the sealed receiver. The argument still throws
// before entering the body when the host is absent.
(({
  of,
  from
}) => [of(3), from([4])])(((null == _globalThis.window ? void 0 : _self).Array, {
  of: _Array$of,
  from: _Array$from
}));