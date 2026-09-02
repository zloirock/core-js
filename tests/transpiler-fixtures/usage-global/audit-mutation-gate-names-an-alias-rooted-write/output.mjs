import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// the same point query, reached through the roots the cheap walk has to FOLLOW rather than read off
// the target: an alias of the global object and an alias of a hopped namespace. each names its
// constructor, so the known narrow drops and the instance dispatch widens. a root the walk cannot
// name at all belongs in its own file - it opens the gate for the WHOLE file, and either row here
// would then be answered by it instead of by the follow under test
const xs = [];
const g = globalThis;
g.Array.from = patch;
Array.from(xs).at(0);
const M = globalThis.self.Object;
M.create = patch;
Object.create(null);