import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$values from "@core-js/pure/actual/object/values";
// an element a transparent IIFE returns is the host's own text: the literal it returns is descended
// and its slot mirrored in place - the call kept, with its body, its effects and the sibling slots as
// written. one static per row
for (const [{
  entries: viaIife
}] of [(() => [{
  entries: _Object$entries
}])()]) use(viaIife({}));
let ticks = 0;
for (const [{
  values: viaIifeBody
}] of [(() => {
  ticks++;
  return [{
    values: _Object$values
  }];
})()]) use(viaIifeBody({}), ticks);
for (const [{
  fromEntries: viaIifeSibling
}, other] of [(() => [{
  fromEntries: _Object$fromEntries
}, 1])()]) use(viaIifeSibling([]), other);
for (const [{
  hasOwn: viaIifeEffect
}] of [(() => [{
  hasOwn: _Object$hasOwn
}, tick()])()]) use(viaIifeEffect({}, 'k'));
for (const [[{
  assign: viaIifeDeep
}]] of [(() => [[{
  assign: _Object$assign
}]])()]) use(viaIifeDeep({}, {}));
for (const {
  k: {
    is: viaIifeKeyed
  }
} of [(() => ({
  k: {
    is: _Object$is
  },
  z: tick()
}))()]) use(viaIifeKeyed(1, 1));