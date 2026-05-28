import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
export const from = _Array$from;
// export-wrapped nested-proxy destructure with multiple emitted statements: extraction
// of `from` must stay exported, AND the residual `{ includes: arrIncludes } = X` must
// remain exported too. previously each emitted statement was either un-exported (babel)
// or carried a duplicate `export` (unplugin) - both pipelines now wrap every emitted
// top-level statement individually and elide the original export wrapper
export const {
  includes: arrIncludes
} = _globalThis;
[from, arrIncludes];