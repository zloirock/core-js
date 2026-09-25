import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an element a transparent IIFE returns is the host's own text: the literal it returns is descended
// and its slot mirrored in place - the call kept, with its body, its effects and the sibling slots as
// written. one static per row
for (const [{
  entries: viaIife
}] of [(() => [Object])()]) use(viaIife({}));
let ticks = 0;
for (const [{
  values: viaIifeBody
}] of [(() => {
  ticks++;
  return [Object];
})()]) use(viaIifeBody({}), ticks);
for (const [{
  fromEntries: viaIifeSibling
}, other] of [(() => [Object, 1])()]) use(viaIifeSibling([]), other);
for (const [{
  hasOwn: viaIifeEffect
}] of [(() => [Object, tick()])()]) use(viaIifeEffect({}, 'k'));
for (const [[{
  assign: viaIifeDeep
}]] of [(() => [[Object]])()]) use(viaIifeDeep({}, {}));
for (const {
  k: {
    is: viaIifeKeyed
  }
} of [(() => ({
  k: Object,
  z: tick()
}))()]) use(viaIifeKeyed(1, 1));