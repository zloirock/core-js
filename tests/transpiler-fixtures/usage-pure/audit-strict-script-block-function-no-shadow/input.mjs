// strict-mode control for the Annex-B pair: under `"use strict"` the block-level function
// stays block-scoped, so the OUTSIDE use reads the global and substitutes as usual
'use strict';

{
  function Array() {
    return null;
  }
}
Array.from([1]);
