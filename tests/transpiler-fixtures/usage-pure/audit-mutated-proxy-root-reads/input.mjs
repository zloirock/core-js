// a bare write of a PROXY-GLOBAL name (`window = fake`, `self++`) replaces the container the
// proxy machinery navigates: the name DEOPTS - reads through it stop folding to pristine
// statics and stay verbatim on the live binding. an alias holds whatever the slot held at
// capture, which no span model orders - alias reads stay raw in both capture orders.
// value-globals are non-writable and never record. the pristine-control twin lives in the
// standard proxy-fold fixtures
window = fake;
use(window.Promise.resolve(1));
self++;
use(self.Map.groupBy(items, tag));
const before = window;
use(before.Set.union(other));
const { WeakMap: W } = window;
use(new W());
class K extends window.Iterator {}
use(K.range(0, 2));
NaN++;
use(NaN);
