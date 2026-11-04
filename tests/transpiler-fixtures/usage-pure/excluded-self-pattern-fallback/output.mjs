import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// The fallback still supplies the pattern when the excluded realm slot is absent.
const {
  from
} = (null == _globalThis.self ? void 0 : {
  from: _Array$from
}) ?? {};
consume(from);