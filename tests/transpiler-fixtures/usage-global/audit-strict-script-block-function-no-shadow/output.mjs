// strict-mode control for the Annex-B pair: under `"use strict"` the block-level function
// stays block-scoped, so the OUTSIDE use reads the global and injects as usual
'use strict';

require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.from");
require("core-js/modules/es.string.iterator");
{
  function Array() {
    return null;
  }
}
Array.from([1]);