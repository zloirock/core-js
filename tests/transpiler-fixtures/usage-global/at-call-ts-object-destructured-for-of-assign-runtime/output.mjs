import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.starts-with";
import "core-js/modules/es.string.bold";
import "core-js/modules/web.dom-collections.iterator";
let at, includes, startsWith, bold;
for ({
  at,
  includes,
  startsWith,
  bold
} of ['hello', 'world']) {}