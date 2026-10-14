import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
// Member targets under a realm hop beside an effect-keyed sibling read the mirrored literal: the key runs in its
// own place and each target is written in source order, alike in both legs.
const o = {};
({
  Object: {
    [(e(), 'entries')]: o.f,
    values: _globalThis.g
  }
} = {
  Object: {
    entries: _Object$entries,
    values: _Object$values
  }
});