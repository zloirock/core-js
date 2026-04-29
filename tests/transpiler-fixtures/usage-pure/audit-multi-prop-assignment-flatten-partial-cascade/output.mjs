import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// destructure assignment с одним полифилл-eligible и одним opaque outer prop. полифилл
// extracts; opaque prop сохраняется в residual destructure (с polyfilled receiver); host
// statement выживает потому что residual всё ещё имеет consumer
let from, x;
({
  custom: {
    x
  }
} = _globalThis);
from = _Array$from;