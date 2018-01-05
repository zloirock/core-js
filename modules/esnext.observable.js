'use strict';
// https://github.com/zenparsing/es-observable
var $export = require('./_export');
var aFunction = require('./_a-function');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var anInstance = require('./_an-instance');
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

var cleanupSubscription = function (subscription) {
  var cleanup = subscription._c;
  if (cleanup) {
    subscription._c = undefined;
    try {
      cleanup();
    } catch (e) {
      hostReportErrors(e);
    }
  }
};

var subscriptionClosed = function (subscription) {
  return subscription._o === undefined;
};

var closeSubscription = function (subscription) {
  if (!subscriptionClosed(subscription)) {
    close(subscription);
    cleanupSubscription(subscription);
  }
};

var close = function (subscription) {
  if (!DESCRIPTORS) {
    subscription.closed = true;
    var subscriptionObserver = subscription._s;
    if (subscriptionObserver) subscriptionObserver.closed = true;
  } subscription._o = undefined;
};

var Subscription = function (observer, subscriber) {
  var start;
  if (!DESCRIPTORS) this.closed = false;
  this._c = undefined;
  this._o = anObject(observer);
  try {
    if (start = getMethod(observer.start)) start.call(observer, this);
  } catch (e) {
    hostReportErrors(e);
  }
  if (subscriptionClosed(this)) return;
  var subscriptionObserver = this._s = new SubscriptionObserver(this);
  try {
    var cleanup = subscriber(subscriptionObserver);
    var subscription = cleanup;
    if (cleanup != null) this._c = typeof cleanup.unsubscribe === 'function'
      ? function () { subscription.unsubscribe(); }
      : aFunction(cleanup);
  } catch (e) {
    subscriptionObserver.error(e);
    return;
  } if (subscriptionClosed(this)) cleanupSubscription(this);
};

Subscription.prototype = redefineAll({}, {
  unsubscribe: function unsubscribe() { closeSubscription(this); }
});

if (DESCRIPTORS) dP(Subscription.prototype, 'closed', {
  configurable: true,
  get: function () {
    return subscriptionClosed(this);
  }
});

var SubscriptionObserver = function (subscription) {
  $(this, { subscription: subscription });
  if (!DESCRIPTORS) this.closed = false;
};

SubscriptionObserver.prototype = redefineAll({}, {
  next: function next(value) {
    var subscription = $(this).subscription;
    if (!subscriptionClosed(subscription)) {
      var observer = subscription._o;
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
    if (!subscriptionClosed(subscription)) {
      var observer = subscription._o;
      close(subscription);
      try {
        var m = getMethod(observer.error);
        if (m) m.call(observer, value);
        else hostReportErrors(value);
      } catch (e) {
        hostReportErrors(e);
      } cleanupSubscription(subscription);
    }
  },
  complete: function complete() {
    var subscription = $(this).subscription;
    if (!subscriptionClosed(subscription)) {
      var observer = subscription._o;
      close(subscription);
      try {
        var m = getMethod(observer.complete);
        if (m) m.call(observer);
      } catch (e) {
        hostReportErrors(e);
      } cleanupSubscription(subscription);
    }
  }
});

if (DESCRIPTORS) dP(SubscriptionObserver.prototype, 'closed', {
  configurable: true,
  get: function () {
    return subscriptionClosed($(this).subscription);
  }
});

var $Observable = function Observable(subscriber) {
  anInstance(this, $Observable, 'Observable');
  $(this, { subscriber: aFunction(subscriber) });
};

redefineAll($Observable.prototype, {
  subscribe: function subscribe(observer) {
    return new Subscription(typeof observer === 'function' ? {
      next: observer,
      error: arguments.length > 1 ? arguments[1] : undefined,
      complete: arguments.length > 2 ? arguments[2] : undefined
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
    for (var i = 0, l = arguments.length, items = new Array(l); i < l;) items[i] = arguments[i++];
    return new (typeof this === 'function' ? this : $Observable)(function (observer) {
      for (var j = 0; j < items.length; ++j) {
        observer.next(items[j]);
        if (observer.closed) return;
      } observer.complete();
    });
  }
});

hide($Observable.prototype, OBSERVABLE, function () { return this; });

$export($export.G, { Observable: $Observable });

require('./_set-species')('Observable');
