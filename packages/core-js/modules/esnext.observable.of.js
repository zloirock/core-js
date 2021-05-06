'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');

// `Observable.of` method
// https://github.com/tc39/proposal-observable
$({ target: 'Observable', stat: true }, {
  of: function of() {
    var C = typeof this === 'function' ? this : getBuiltIn('Observable');
    var length = arguments.length;
    var items = new Array(length);
    var index = 0;
    while (index < length) items[index] = arguments[index++];
    return new C(function (observer) {
      for (var i = 0; i < length; i++) {
        observer.next(items[i]);
        if (observer.closed) return;
      } observer.complete();
    });
  },
});
