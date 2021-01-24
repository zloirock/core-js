var $ = require('../internals/export');
var IE9 = require('../internals/engine-is-ie9');
var wrap = require('../internals/schedulers-wrapper');

// ie9 `setInterval` additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval
$({ global: true, bind: true, forced: IE9 }, {
  setInterval: wrap('setInterval'),
});
