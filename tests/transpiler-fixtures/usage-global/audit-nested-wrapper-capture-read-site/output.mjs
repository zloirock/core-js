import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a leaf captured through a const-bound array wrapper anchors its reassignment check at
// the WRAPPER's declarator (the capture point), not the destructure host: a source write
// BETWEEN capture and destructure cannot change the captured value, so the static injects
let capturedMap = globalThis.Map;
const wrapper = [{
  inner: capturedMap
}];
capturedMap = {};
const [{
  inner: {
    groupBy
  }
}] = wrapper;
export { groupBy };

// negative: a write BEFORE the capture dominates the capture read - the leaf stays raw
// (no `es.iterator.from`; the ctor-set noise comes from the value read alone)
let src2 = globalThis.Iterator;
src2 = {};
const wrapper2 = [{
  inner: src2
}];
const [{
  inner: {
    from
  }
}] = wrapper2;
export { from };

// TWO wrapper levels: the capture walk resolves ONE wrapper level - a second level stays
// raw on both emitters (bias-safe under-inject: only the constructor value-read group
// appears, no static entry). the probe is a uniquely-attributable STATIC, so a future
// depth-2 resolution would surface here as a new import
let capturedPromise = globalThis.Promise;
const w1 = [{
  a: capturedPromise
}];
capturedPromise = {};
const w2 = [{
  b: w1[0]
}];
const [{
  b: {
    a: {
      withResolvers
    }
  }
}] = [w2[0]];
export { withResolvers };