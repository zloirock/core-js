import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// A consumed nested slot lends its default to the overwrite.
// Rewrites inside that default must survive deferred emission.
let method;
({
  slot: {
    at: method = Array.from(source).flatMap(project)
  }
} = {
  slot: receiver
});