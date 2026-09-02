import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// the negative half of the same rule: a call the scoped stage cannot follow to a function
// literal - a member callee, and a callee this file never binds - reaches no namespace there
// either, so the query rules the file out and the `Array.from` narrow survives
const xs = [];
const el = document.createElement('div');
el.className = 'x';
const mod = require('some-lib');
mod.helper = patch;
Array.from(xs).at(0);