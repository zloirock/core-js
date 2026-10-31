require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.at");
require("core-js/modules/es.array.find");
require("core-js/modules/es.array.find-index");
require("core-js/modules/es.array.from");
require("core-js/modules/es.array.includes");
require("core-js/modules/es.array.of");
require("core-js/modules/es.string.iterator");
// an entry require in ANY slot of a statement-position comma sequence is an entry: that is how a
// minifier joins statements - head, middle or tail - and every slot's value is discarded there
// exactly as on its own line. the sequence is split into its statements first, so the entry is
// read where a plain `require('core-js/...');` is and its neighbours stay as statements when it
// is removed, at any depth. a require whose value is USED is not an entry and stays, prefix and
// all; an opt-out over the joined statement covers every product
eff();
head();
a();
b();
c();
d();
const kept = (e(), require('core-js/actual/array/flat'));
// core-js-disable-next-line
f();
// core-js-disable-next-line
require('core-js/actual/array/last-index-of');