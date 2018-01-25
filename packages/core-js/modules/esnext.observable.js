'use strict';
// https://github.com/zenparsing/es-observable
var aFunction = require('core-js-internals/a-function');
var anObject = require('core-js-internals/an-object');
var isObject = require('core-js-internals/is-object');
var anInstance = require('core-js-internals/an-instance');
var redefineAll = require('./_redefine-all');
var hide = require('./_hide');
var getIterator = require('./core.get-iterator');
var forOf = require('./_for-of');
var hostReportErrors = require('./_host-report-errors');
var dP = require('./_object-dp').f;
var $ = require('./_state');
var DESCRIPTORS = require('./_descriptors');
var OBSERVABLE = require('./_wks')('observable');
var RETURN = forOf.RETURN;

var getMethod = function (fn) {
  return fn == null ? undefined : aFunction(fn);
};

var cleanupSubscription = function (subscriptionState) {
  var cleanup = subscriptionState.cleanup;
  if (cleanup) {
    subscriptionState.cleanup = undefined;
    try {
      cleanup();
    } catch (e) {
      hostReportErrors(e);
    }
  }
};

var subscriptionClosed = function (subscriptionState) {
  return subscriptionState.observer === undefined;
};

var close = function (subscription, subscriptionState) {
  if (!DESCRIPTORS) {
    subscription.closed = true;
    var subscriptionObserver = subscriptionState.subscriptionObserver;
    if (subscriptionObserver) subscriptionObserver.closed = true;
  } subscriptionState.observer = undefined;
};

var Subscription = function (observer, subscriber) {
  var subscriptionState = $(this, {
    cleanup: undefined,
    observer: anObject(observer),
    subscriptionObserver: undefined
  });
  var start;
  if (!DESCRIPTORS) this.closed = false;
  try {
    if (start = getMethod(observer.start)) start.call(observer, this);
  } catch (e) {
    hostReportErrors(e);
  }
  if (subscriptionClosed(subscriptionState)) return;
  var subscriptionObserver = subscriptionState.subscriptionObserver = new SubscriptionObserver(this);
  try {
    var cleanup = subscriber(subscriptionObserver);
    var subscription = cleanup;
    if (cleanup != null) subscriptionState.cleanup = typeof cleanup.unsubscribe === 'function'
      ? function () { subscription.unsubscribe(); }
      : aFunction(cleanup);
  } catch (e) {
    subscriptionObserver.error(e);
    return;
  } if (subscriptionClosed(subscriptionState)) cleanupSubscription(subscriptionState);
};

Subscription.prototype = redefineAll({}, {
  unsubscribe: function unsubscribe() {
    var subscriptionState = $(this);
    if (!subscriptionClosed(subscriptionState)) {
      close(this, subscriptionState);
      cleanupSubscription(subscriptionState);
    }
  }
});

if (DESCRIPTORS) dP(Subscription.prototype, 'closed', {
  configurable: true,
  get: function () {
    return subscriptionClosed($(this));
  }
});

var SubscriptionObserver = function (subscription) {
  $(this, { subscription: subscription });
  if (!DESCRIPTORS) this.closed = false;
};

SubscriptionObserver.prototype = redefineAll({}, {
  next: function next(value) {
    var subscriptionState = $($(this).subscription);
    if (!subscriptionClosed(subscriptionState)) {
      var observer = subscriptionState.observer;
      try {
        var m = getMethod(observer.next);
        if (m) m.call(observer, value);
      } catch (e) {
        hostReportErrors(e);
      }
    }
  },
  error: function error(value) {
    var subscription = $(this).subscription;
    var subscriptionState = $(subscription);
    if (!subscriptionClosed(subscriptionState)) {
      var observer = subscriptionState.observer;
      close(subscription, subscriptionState);
      try {
        var m = getMethod(observer.error);
        if (m) m.call(observer, value);
        else hostReportErrors(value);
      } catch (e) {
        hostReportErrors(e);
      } cleanupSubscription(subscriptionState);
    }
  },
  complete: function complete() {
    var subscription = $(this).subscription;
    var subscriptionState = $(subscription);
    if (!subscriptionClosed(subscriptionState)) {
      var observer = subscriptionState.observer;
      close(subscription, subscriptionState);
      try {
        var m = getMethod(observer.complete);
        if (m) m.call(observer);
      } catch (e) {
        hostReportErrors(e);
      } cleanupSubscription(subscriptionState);
    }
  }
});

if (DESCRIPTORS) dP(SubscriptionObserver.prototype, 'closed', {
  configurable: true,
  get: function () {
    return subscriptionClosed($($(this).subscription));
  }
});

var $Observable = function Observable(subscriber) {
  anInstance(this, $Observable, 'Observable');
  $(this, { subscriber: aFunction(subscriber) });
};

redefineAll($Observable.prototype, {
  subscribe: function subscribe(observer) {
    var argumentsLength = arguments.length;
    return new Subscription(typeof observer === 'function' ? {
      next: observer,
      error: argumentsLength > 1 ? arguments[1] : undefined,
      complete: argumentsLength > 2 ? arguments[2] : undefined
    } : isObject(observer) ? observer : {}, $(this).subscriber);
  }
});

redefineAll($Observable, {
  from: function from(x) {
    var C = typeof this === 'function' ? this : $Observable;
    var method = getMethod(anObject(x)[OBSERVABLE]);
    if (method) {
      var observable = anObject(method.call(x));
      return observable.constructor === C ? observable : new C(function (observer) {
        return observable.subscribe(observer);
      });
    }
    var iterator = getIterator(x);
    return new C(function (observer) {
      forOf(iterator, false, function (it) {
        observer.next(it);
        if (observer.closed) return RETURN;
      }, undefined, true);
      observer.complete();
    });
  },
  of: function of() {
    for (var i = 0, argumentsLength = arguments.length, items = new Array(argumentsLength); i < argumentsLength;) {
      items[i] = arguments[i++];
    }
    return new (typeof this === 'function' ? this : $Observable)(function (observer) {
      for (var j = 0; j < items.length; ++j) {
        observer.next(items[j]);
        if (observer.closed) return;
      } observer.complete();
    });
  }
});

hide($Observable.prototype, OBSERVABLE, function () { return this; });

require('./_export')({ global: true }, { Observable: $Observable });

require('./_set-species')('Observable');
