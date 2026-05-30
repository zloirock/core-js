import _Array$from from "@core-js/pure/actual/array/from";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// minifier-collapsed destructure-in-sequence nested THREE levels deep: each
// `(prefix, ({pat} = R))` lives inside the one above it. a single rewrite pass can only split
// the outermost statement (splitting an inner one would re-edit text the outer split already
// touched), so the pre-pass must split outermost, re-parse, then repeat until every level is
// flattened. distinct statics per level prove each nested destructure RHS was reached
(function () {
  (function () {
    eff();
    ({
      x
    } = _Object$fromEntries(e));
  });
  ({
    y
  } = _Array$from(z));
});
({
  z
} = _Object$entries(w));