import _Object$isFrozen from "@core-js/pure/actual/object/is-frozen";
// ... read through the transparent wrappers a source may spell (a paren node one parser keeps)
for (const {
  w: {
    isFrozen: viaParens
  }
} of [{
  w: {
    isFrozen: _Object$isFrozen
  }
}, {
  w: {
    isFrozen: _Object$isFrozen
  }
}]) viaParens;