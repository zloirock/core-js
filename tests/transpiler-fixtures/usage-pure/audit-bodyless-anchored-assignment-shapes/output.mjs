import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// anchored assignment renders on unbraced control slots: a single-statement render
// (zero-extraction residual, with or without rest) keeps the slot bodyless; a mixed
// extraction + residual render block-wraps
let custom1, custom2, r, g;
if (c1()) ({
  custom: custom1
} = _Map);
if (c2()) ({
  custom: custom2,
  ...r
} = _Promise);
if (c3()) {
  ({
    customI
  } = _Iterator);
  g = _Iterator$zip;
}
console.log(custom1, custom2, r, g);