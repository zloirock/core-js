import _Object$assign from "@core-js/pure/actual/object/assign";
for (const {
  w: {
    assign: viaGetter
  }
} of [{
  w: {
    assign: _Object$assign
  }
}, {
  get w() {
    return {
      assign: _Object$assign
    };
  }
}]) viaGetter;