/**
 * ES6 Promises
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects
 * https://github.com/domenic/promises-unwrapping
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * http://kangax.github.io/es5-compat-table/es6/#Promise
 * http://caniuse.com/promises
 * Based on:
 * https://github.com/jakearchibald/ES6-Promises
 * Alternatives:
 * https://github.com/jakearchibald/ES6-Promises
 * https://github.com/inexorabletash/polyfill/blob/master/harmony.js
 */
!function(Promise){
  isNative(Promise)
  &&  array('cast,resolve,reject,all,race').every(part.call(has, Promise))
  // Older version of the spec had a resolver object as the arg rather than a function
  // Experimental implementations contains a number of inconsistencies with the spec,
  // such as this: onFulfilled must be a function or undefined
  &&  (function(resolve){
        try {
          new Promise(function(r){
            resolve = r;
          }).then(null);
          return isFunction(resolve);
        } catch(e){}
      })()
  || !function(){
    var PENDING
      , SEALED    = 0
      , FULFILLED = 1
      , REJECTED  = 2
      , SUBSCRIBERS = symbol('subscribers')
      , STATE       = symbol('state')
      , DETAIL      = symbol('detail')
      , ITERABLE_ERROR = 'You must pass an array to race or all';
    // https://github.com/domenic/promises-unwrapping#the-promise-constructor
    Promise = function(resolver){
      var promise       = this
        , rejectPromise = part.call(handle, promise, REJECTED);
      assertInstance(promise, Promise, 'Promise');
      assertFunction(resolver);
      promise[SUBSCRIBERS] = [];
      try {
        resolver(part.call(resolve, promise), rejectPromise);
      } catch(e){
        rejectPromise(e);
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
      else if(failed)handle(promise, REJECTED, error);
      else if(settled == FULFILLED)resolve(promise, value);
      else if(settled == REJECTED)handle(promise, REJECTED, value);
    }
    assign(Promise[prototype], {
      /**
       * 25.4.5.1 Promise.prototype.catch ( onRejected )
       * https://github.com/domenic/promises-unwrapping#promiseprototypecatch--onrejected-
       */
      'catch': function(onRejected){
        return this.then(undefined, onRejected);
      },
      /**
       * 25.4.5.3 Promise.prototype.then ( onFulfilled , onRejected )
       * https://github.com/domenic/promises-unwrapping#promiseprototypethen--onfulfilled--onrejected-
       */
      then: function(onFulfilled, onRejected){
        var promise     = this
          , thenPromise = new Promise(Function());
        if(promise[STATE])setImmediate(function(){
          invokeCallback(promise[STATE], thenPromise, arguments[promise[STATE] - 1], promise[DETAIL]);
        }, onFulfilled, onRejected);
        else promise[SUBSCRIBERS].push(thenPromise, onFulfilled, onRejected);
        return thenPromise;
      }
    });
    assign(Promise, {
      /**
       * 25.4.4.1 Promise.all ( iterable )
       * https://github.com/domenic/promises-unwrapping#promiseall--iterable-
       */
      all: function(iterable){
        assert(isArray(iterable), ITERABLE_ERROR);
        return new this(function(resolve, reject){
          var results   = []
            , remaining = iterable.length;
          function resolveAll(index, value){
            results[index] = value;
            --remaining || resolve(results);
          }
          if(remaining)iterable.forEach(function(promise, i){
            promise && isFunction(promise.then)
              ? promise.then(part.call(resolveAll, i), reject)
              : resolveAll(i, promise);
          });
          else resolve(results);
        });
      },
      /**
       * 25.4.4.2 Promise.cast ( x )
       * https://github.com/domenic/promises-unwrapping#promisecast--x-
       */
      cast: function(x){
        return x instanceof this ? x : $resolve.call(this, x);
      },
      /**
       * 25.4.4.4 Promise.race ( iterable )
       * https://github.com/domenic/promises-unwrapping#promiserace--iterable-
       */
      race: function(iterable){
        assert(isArray(iterable), ITERABLE_ERROR);
        return new this(function(resolve, reject){
          iterable.forEach(function(promise){
            promise && isFunction(promise.then)
              ? promise.then(resolve, reject)
              : resolve(promise);
          });
        });
      },
      /**
       * 25.4.4.5 Promise.reject ( r )
       * https://github.com/domenic/promises-unwrapping#promisereject--r-
       */
      reject: function(r){
        return new this(function(resolve, reject){
          reject(r);
        });
      },
      /**
       * 25.4.4.6 Promise.resolve ( x )
       * https://github.com/domenic/promises-unwrapping#promiseresolve--x-
       */
      resolve: $resolve
    });
    function $resolve(x){
      return new this(function(resolve, reject){
        resolve(x);
      });
    }
    function handleThenable(promise, value){
      var resolved;
      try {
        assert(promise !== value, 'A promises callback cannot return that same promise.');
        if(value && isFunction(value.then)){
          value.then(function(val){
            if(resolved)return true;
            resolved = true;
            if(value !== val)resolve(promise, val);
            else handle(promise, FULFILLED, val);
          }, function(val){
            if(resolved)return true;
            resolved = true;
            handle(promise, REJECTED, val);
          });
          return 1;
        }
      } catch(error){
        if(!resolved)handle(promise, REJECTED, error);
        return 1;
      }
    }
    function resolve(promise, value){
      if(promise === value || !handleThenable(promise, value))handle(promise, FULFILLED, value);
    }
    function handle(promise, state, reason){
      if(promise[STATE] === PENDING){
        promise[STATE]  = SEALED;
        promise[DETAIL] = reason;
        setImmediate(function(){
          promise[STATE] = state;
          for(var subscribers = promise[SUBSCRIBERS], i = 0; i < subscribers.length; i += 3){
            invokeCallback(state, subscribers[i], subscribers[i + state], promise[DETAIL]);
          }
          promise[SUBSCRIBERS] = undefined;
        });
      }
    }
  }();
  $define(GLOBAL, {Promise: Promise}, 1);
}(global.Promise);