import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
for (const {
  w: {
    x: {
      hasOwn: viaTwoHops
    }
  }
} of [{
  w: {
    x: {
      hasOwn: _Object$hasOwn
    }
  }
}, {
  w: {
    x: {
      hasOwn: _Object$hasOwn
    }
  }
}]) viaTwoHops;