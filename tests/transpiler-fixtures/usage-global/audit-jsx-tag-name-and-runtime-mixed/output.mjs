import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A JSX tag keeps its source binding. It does not hand out the constructor binding
// pure substitutes at the ordinary runtime reference, so that binding stays narrow.
// Global injection still supplies the family the renderer can read through the tag.
const el = <Map data={x} />;
const m = new Map();