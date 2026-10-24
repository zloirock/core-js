import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an install of a dispatching prototype in an arm the build never takes never runs, so the binding keeps
// the family its initializer built - under an `if`, an `&&`, a ternary and an `||` alike - while an
// install in the arm it always takes names the installed family. the presence tests load the `Symbol`
// modules and `new Map()` its family; distinct method per line
const list = [1];
if (typeof Symbol == 'undefined') Object.setPrototypeOf(list, String.prototype);
use(list.includes(1));
const map = new Map();
typeof Symbol == 'undefined' && (map.__proto__ = Array.prototype);
use(map.at(0));
const kept = [1];
if (typeof Symbol != 'undefined') Object.setPrototypeOf(kept, String.prototype);
use(kept.padEnd(3));
const picked = [1];
typeof Symbol == 'undefined' ? Object.setPrototypeOf(picked, String.prototype) : 0;
use(picked.findLast(Boolean));
const fallen = [1];
typeof Symbol != 'undefined' || Object.setPrototypeOf(fallen, String.prototype);
use(fallen.flat());