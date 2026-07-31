import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an `additionalPackages` fork source flows through the TS require-import recognition exactly
// like the main package - the packages list gates it (the same fork import without the option
// resolves nothing; only the core-js prefix passes the source check unconditionally)
import gf = require("@fork/core-js/actual/global-this");
export const viaForkTsEquals = gf.Map.groupBy([], (x: number) => x);