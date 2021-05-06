'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var anObject = require('../internals/an-object');
var getIterator = require('../internals/get-iterator');
var getMethod = require('../internals/get-method');
var iterate = require('../internals/iterate');
var wellKnownSymbol = require('../internals/well-known-symbol');

var OBSERVABLE = wellKnownSymbol('observable');

// `Observable.from` method
// https://github.com/tc39/proposal-observable
$({ target: 'Observable', stat: true }, {
  from: function from(x) {
    var C = typeof this === 'function' ? this : getBuiltIn('Observable');
    var observableMethod = getMethod(anObject(x)[OBSERVABLE]);
    if (observableMethod) {
      var observable = anObject(observableMethod.call(x));
      return observable.constructor === C ? observable : new C(function (observer) {
        return observable.subscribe(observer);
      });
    }
    var iterator = getIterator(x);
    return new C(function (observer) {
      iterate(iterator, function (it, stop) {
        observer.next(it);
        if (observer.closed) return stop();
      }, { IS_ITERATOR: true, INTERRUPTED: true });
      observer.complete();
    });
  },
});
