// catch-default block-bodied IIFE (`(function () { return [1].at(0); })()`): the inner `.at` memo
// declares `_ref` via a scoped-var INSERT at the block (not an arrow body-wrap overwrite), so the
// relocate keeps the insert as a splice while composing the `.at` overwrite separately
try {} catch ({ [Symbol.iterator]: it = (function () { return [1].at(0); })() }) { it; }
