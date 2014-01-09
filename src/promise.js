/**
 * ES6 Promises
 * https://github.com/domenic/promises-unwrapping
 * Based on:
 * https://github.com/jakearchibald/ES6-Promises
 * https://github.com/tildeio/rsvp.js
 */
!function(Promise){
  isFunction(Promise)
  // Some of these methods are missing from Firefox/Chrome experimental implementations
  &&  splitComma('cast,resolve,reject,all,race').every($part(has, Promise))
  // Older version of the spec had a resolver object as the arg rather than a function
  &&  (function(resolve){
        new Promise(function(r){ resolve = r });
        return isFunction(resolve)
      })()
  && 0
  || !function(){
    var PENDING
      , SEALED    = 0
      , FULFILLED = 1
      , REJECTED  = 2
      , _subscribers = '_subscribers'
      , _state = '_state'
      , _detail = '_detail'
      , setImmediate = global.setImmediate
      // https://github.com/domenic/promises-unwrapping#the-promise-constructor
      , Promise = global.Promise = function(resolver){
          var promise       = this
            , rejectPromise = $part(reject, promise);
          if(!isFunction(resolver))throw TypeError('First argument of Promise constructor must be an function');
          if(!(promise instanceof Promise))throw TypeError('Promise constructor cannot be called as a function.');
          promise[_subscribers] = [];
          try {
            resolver($part(resolve, promise), rejectPromise)
          } catch(e){
            rejectPromise(e)
          }
        }
    function invokeCallback(settled, promise, callback, detail){
      var hasCallback = isFunction(callback)
        , value, error, succeeded, failed;
      if(hasCallback){
        try {
          value     = callback(detail);
          succeeded = 1;
        } catch(e){
          failed = 1;
          error  = e;
        }
      } else {
        value = detail;
        succeeded = 1;
      }
      if(handleThenable(promise, value))return;
      else if(hasCallback && succeeded)resolve(promise, value);
      else if(failed)reject(promise, error);
      else if(settled === FULFILLED)resolve(promise, value);
      else if(settled === REJECTED)reject(promise, value);
    }
    function publish(promise, settled){
      var subscribers = promise[_subscribers]
        , detail = promise[_detail]
        , child, callback, i = 0;
      for(; i < subscribers.length; i += 3){
        child = subscribers[i];
        callback = subscribers[i + settled];
        invokeCallback(settled, child, callback, detail);
      }
      promise[_subscribers] = null;
    }
    assign(Promise[prototype], {
      // https://github.com/domenic/promises-unwrapping#promiseprototypecatch--onrejected-
      'catch': function(onRejection){
        return this.then(null, onRejection);
      },
      // https://github.com/domenic/promises-unwrapping#promiseprototypethen--onfulfilled--onrejected-
      then: function(onFulfillment, onRejection){
        var promise     = this
          , thenPromise = new Promise(Function())
          , subscribers, length;
        if(promise[_state])setImmediate(function(){
          invokeCallback(promise[_state], thenPromise, arguments[promise[_state] - 1], promise[_detail])
        }, onFulfillment, onRejection);
        else {
          subscribers = promise[_subscribers];
          length      = subscribers.length;
          subscribers[length] = thenPromise;
          subscribers[length + FULFILLED] = onFulfillment;
          subscribers[length + REJECTED]  = onRejection;
        }
        return thenPromise;
      }
    });
    assign(Promise, {
      // https://github.com/domenic/promises-unwrapping#promiseall--iterable-
      all: function(promises){
        if(!isArray(promises))throw TypeError('You must pass an array to all.');
        return new this(function(resolve, reject){
          var results   = []
            , remaining = promises.length
            , promise, i;
          if(remaining === 0)resolve([]);
          function resolveAll(index, value){
            results[index] = value;
            if(--remaining === 0)resolve(results)
          }
          for(i = 0; i < promises.length; i++){
            (promise = promises[i]) && isFunction(promise.then)
              ? promise.then($part(resolveAll, i), reject)
              : resolveAll(i, promise)
          }
        })
      },
      // https://github.com/domenic/promises-unwrapping#promisecast--x-
      cast: function(object){
        if(object && object instanceof this)return object;
        return new this(function(resolve){
          resolve(object)
        })
      },
      // https://github.com/domenic/promises-unwrapping#promiserace--iterable-
      race: function(promises){
        if(!isArray(promises))throw TypeError('You must pass an array to race.');
        return new this(function(resolve, reject){
          var results = []
            , i = 0, promise;
          while(promises.length > i){
            (promise = promises[i++]) && isFunction(promise.then)
              ? promise.then(resolve, reject)
              : resolve(promise)
          }
        })
      },
      // https://github.com/domenic/promises-unwrapping#promisereject--r-
      reject: function(reason){
        return new this(function(resolve, reject){
          reject(reason)
        })
      },
      // https://github.com/domenic/promises-unwrapping#promiseresolve--x-
      resolve: function(value){
        return new this(function(resolve, reject){
          resolve(value)
        })
      }
    });
    function handleThenable(promise, value){
      var resolved;
      try {
        if(promise === value)throw TypeError('A promises callback cannot return that same promise.');
        if(isObject(value)){
          if(isFunction(value.then)){
            value.then(function(val){
              if(resolved)return true;
              resolved = true;
              if(value !== val)resolve(promise, val);
              else fulfill(promise, val)
            }, function(val){
              if(resolved)return true;
              resolved = true;
              reject(promise, val)
            });
            return true
          }
        }
      } catch(error){
        if(!resolved)reject(promise, error);
        return true
      }
      return false
    }
    function resolve(promise, value){
      if(promise === value || !handleThenable(promise, value))fulfill(promise, value)
    }
    function fulfill(promise, value){
      if(promise[_state] === PENDING){
        promise[_state]  = SEALED;
        promise[_detail] = value;
        setImmediate(function(){
          publish(promise, promise[_state] = FULFILLED)
        })
      }
    }
    function reject(promise, reason){
      if(promise[_state] === PENDING){
        promise[_state]  = SEALED;
        promise[_detail] = reason;
        setImmediate(function(){
          publish(promise, promise[_state] = REJECTED)
        })
      }
    }
  }();
}(global.Promise);