// an entry require in ANY slot of a statement-position comma sequence is an entry: that is how a
// minifier joins statements - head, middle or tail - and every slot's value is discarded there
// exactly as on its own line. the sequence is split into its statements first, so the entry is
// read where a plain `require('core-js/...');` is and its neighbours stay as statements when it
// is removed, at any depth. a require whose value is USED is not an entry and stays, prefix and
// all; an opt-out over the joined statement covers every product
(eff(), require('core-js/actual/array/from'));
(require('core-js/actual/array/of'), head());
(a(), require('core-js/actual/array/at'), b());
(c(), (d(), require('core-js/actual/array/includes')));
(require('core-js/actual/array/find'), require('core-js/actual/array/find-index'));
const kept = (e(), require('core-js/actual/array/flat'));
// core-js-disable-next-line
(f(), require('core-js/actual/array/last-index-of'));
