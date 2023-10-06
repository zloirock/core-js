'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');

// `self` getter
// https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-self
$({ global: true, forced: globalThis.self !== globalThis }, {
  self: globalThis,
});
