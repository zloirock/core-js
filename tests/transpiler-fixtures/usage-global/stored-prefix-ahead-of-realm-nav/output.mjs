import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// a nested claim off the realm whose init runs a prefix first - a store into a member, which may
// run a setter, or a sequence element: the prefix rides the dispatch once and the receiver is the
// realm it leaves. re-reading the whole init as the receiver would run the store or the prefix a
// second time. a loop head and a chain of stores carry it the same way
const {
  Array: {
    prototype: {
      flat
    }
  }
} = o.k = globalThis.self;
const {
  String: {
    prototype: {
      at
    }
  }
} = (eff(), globalThis.self);
for (const {
  Array: {
    prototype: {
      includes
    }
  }
} = x = box.k = globalThis.self;;) break;