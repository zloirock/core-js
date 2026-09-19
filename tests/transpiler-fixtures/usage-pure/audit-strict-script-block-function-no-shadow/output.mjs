// strict-mode control for the Annex-B pair: under `"use strict"` the block-level function
// stays block-scoped, so the OUTSIDE use reads the global and substitutes as usual
'use strict';

var _Array$from = require("@core-js/pure/actual/array/from");
{
  function Array() {
    return null;
  }
}
_Array$from([1]);