import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A consumed level records how the level below hangs off it. An OBJECT hop holds its child at the
// property its key names, while an ARRAY level holds it at an element, and a render that re-linked
// every level by position wrote an element index onto an object literal and THREW on ordinary
// source. Spelled with a receiver the level cannot fold away, so the levels really are consumed.
const log = [];
const mk = () => {
  log.push('mk');
  return Array;
};
function tag() {
  log.push('tag');
  return Array;
}
const {
  c: [{
    of: viaCall,
    from: alsoViaCall
  }]
} = {
  c: [mk()]
};
const {
  c: [{
    of: viaTag
  }]
} = {
  c: [tag`x`]
};
const {
  c: [{
    from: viaBare
  }]
} = {
  c: [Array]
};
const {
  a: {
    c: [{
      of: twoHops
    }]
  }
} = {
  a: {
    c: [mk()]
  }
};
export { viaCall, alsoViaCall, viaTag, viaBare, twoHops, log };