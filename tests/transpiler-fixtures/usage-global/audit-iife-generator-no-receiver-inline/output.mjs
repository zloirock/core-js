import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// generator IIFE wraps the bare return in a Generator object - the receiver is the
// generator, not the yielded / returned value. inlining the body's return / yield as the
// receiver type would emit `es.string.starts-with` based on the literal string here, but
// the actual `.startsWith` call goes against Generator (and resolves to undefined at
// runtime - user error, but plugin must not over-inject)
(function* () {
  return 'preamble';
})().startsWith('p');
// sync IIFE control on a different method to isolate per-line origin of imports
(() => 'tail')().padEnd(8);