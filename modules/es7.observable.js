// Based on https://github.com/zenparsing/es-observable/blob/master/src/Observable.js
var $              = require('./$')
  , $def           = require('./$.def')
  , $redef         = require('./$.redef')
  , $mix           = require('./$.mix')
  , asap           = require('./$.task').set
  , assert         = require('./$.assert')
  , OBSERVER       = require('./$.wks')('observer')
  , isFunction     = $.isFunction
  , assertObject   = assert.obj
  , assertFunction = assert.fn;

// === Abstract Operations ===
function cancelSubscription(observer){
  var subscription = observer._subscription;
  if(!subscription)return;
  // Drop the reference to the subscription so that we don't unsubscribe
  // more than once
  observer._subscription = undefined;
  try {
    // Call the unsubscribe function
    subscription.unsubscribe();
  } finally {
    // Drop the reference to the inner observer so that no more notifications
    // will be sent
    observer._observer = undefined;
  }
}

function closeSubscription(observer){
  observer._observer = undefined;
  cancelSubscription(observer);
}

function hasUnsubscribe(x){
  return $.isObject(x) && isFunction(x.unsubscribe);
}

function SubscriptionObserver(observer){
  this._observer = observer;
  this._subscription = undefined;
}
$mix(SubscriptionObserver.prototype, {
  next: function(value){
    var observer = this._observer
      , result;
    // If the stream if closed, then return a "done" result
    if(!observer)return { value: undefined, done: true };
    try {
      // Send the next value to the sink
      result = observer.next(value);
    } catch (e) {
      // If the observer throws, then close the stream and rethrow the error
      closeSubscription(this);
      throw e;
    }
    // Cleanup if sink is closed
    if(result && result.done)closeSubscription(this);
    return result;
  },
  'throw': function(value){
    var observer = this._observer;
    // If the stream is closed, throw the error to the caller
    if(!observer)throw value;
    this._observer = undefined;
    try {
      // If the sink does not support "throw", then throw the error to the caller
      if(!('throw' in observer))throw value;
      return observer['throw'](value);
    } finally {
      cancelSubscription(this);
    }
  },
  'return': function(value){
    var observer = this._observer;
    // If the stream is closed, then return a done result
    if (!observer)return {value: value, done: true};
    this._observer = undefined;
    try {
      // If the sink does not support "return", then return a done result
      if (!('return' in observer))return {value: value, done: true};
      return observer['return'](value);
    } finally {
      cancelSubscription(this);
    }
  }
});

function Observable(subscriber){
  // The stream subscriber must be a function
  this._subscriber = assertFunction(subscriber);
}
$mix(Observable.prototype, {
  subscribe: function(observer){
    // The sink must be an object
    assertObject(observer);
    var unsubscribed = false
      , that = this
      , subscription;
    asap.call(global, function(){
      if(!unsubscribed)subscription = that[OBSERVER](observer);
    });
    return {
      unsubscribe: function(){
        if(unsubscribed)return;
        unsubscribed = true;
        if(subscription)subscription.unsubscribe();
      }
    };
  },
  forEach: function(fn, thisArg){
    var that = this;
    return new ($.core.Promise || $.g.Promise)(function(resolve, reject){
      assertFunction(fn);
      that.subscribe({
        next: function(value){ fn.call(thisArg, value); },
        'throw': function(value){ reject(value); },
        'return': function(){ resolve(undefined); }
      });
    });
  }
});
$redef(Observable.prototype, OBSERVER, function(observer){
  // The sink must be an object
  // Wrap the observer in order to maintain observation invariants
  observer = new SubscriptionObserver(assertObject(observer));
  var subscription;
  try {
    // Call the subscriber function
    subscription = this._subscriber.call(undefined, observer);
    if(!hasUnsubscribe(subscription)){
      var unsubscribe = isFunction(subscription)
        ? subscription
        : function(){ observer['return'](); };
      subscription = {unsubscribe: unsubscribe};
    }
  } catch(e){
    // If an error occurs during startup, then attempt to send the error
    // to the observer
    observer['throw'](e);
  }
  observer._subscription = subscription;
  // If the stream is already finished, then perform cleanup
  if(!observer._observer)cancelSubscription(observer);
  // Return the subscription object
  return subscription;
});
$redef(Observable, 'from', function(x){
  if(assertObject(x)._subscriber && x.constructor === this)return x;
  var subscribeFunction = assertFunction(x[OBSERVER]);
  return new this(function(sink){
    subscribeFunction.call(x, sink);
  });
});


$def($def.G + $def.F, {Observable: Observable});
$def($def.S, 'Symbol', {observer: OBSERVER});