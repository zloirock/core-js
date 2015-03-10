'use strict';
require('./es6.iterators');
var $       = require('./$')
  , ctx     = require('./$.ctx')
  , cof     = require('./$.cof')
  , $def    = require('./$.def')
  , assert  = require('./$.assert')
  , forOf   = require('./$.iter').forOf
  , SPECIES = require('./$.wks')('species')
  , RECORD  = require('./$.uid').safe('record')
  , PROMISE = 'Promise'
  , global  = $.g
  , process = global.process
  , asap    = process && process.nextTick || require('./$.task').set
  , Promise = global[PROMISE]
  , Base    = Promise
  , isFunction     = $.isFunction
  , isObject       = $.isObject
  , assertFunction = assert.fn
  , assertObject   = assert.obj
  , test;
isFunction(Promise) && isFunction(Promise.resolve)
&& Promise.resolve(test = new Promise(function(){})) == test
|| function(){
  function isThenable(it){
    var then;
    if(isObject(it))then = it.then;
    return isFunction(then) ? then : false;
  }
  function handledRejectionOrHasOnRejected(promise){
    var record = promise[RECORD]
      , chain  = record.c
      , i      = 0
      , react;
    if(record.h)return true;
    while(chain.length > i){
      react = chain[i++];
      if(react.fail || handledRejectionOrHasOnRejected(react.P))return true;
    }
  }
  function notify(record, reject){
    var chain = record.c;
    if(reject || chain.length)asap(function(){
      var promise = record.p
        , value   = record.v
        , ok      = record.s == 1
        , i       = 0;
      if(reject && !handledRejectionOrHasOnRejected(promise)){
        setTimeout(function(){
          if(!handledRejectionOrHasOnRejected(promise)){
            if(cof(process) == 'process'){
              if(!process.emit('unhandledRejection', value, promise)){
                // default node.js behavior
              }
            } else if(global.console && isFunction(console.error)){
              console.error('Unhandled promise rejection', value);
            }
          }
        }, 1e3);
      } else while(chain.length > i)!function(react){
        var cb = ok ? react.ok : react.fail
          , ret, then;
        try {
          if(cb){
            if(!ok)record.h = true;
            ret = cb === true ? value : cb(value);
            if(ret === react.P){
              react.rej(TypeError(PROMISE + '-chain cycle'));
            } else if(then = isThenable(ret)){
              then.call(ret, react.res, react.rej);
            } else react.res(ret);
          } else react.rej(value);
        } catch(err){
          react.rej(err);
        }
      }(chain[i++]);
      chain.length = 0;
    });
  }
  function resolve(value){
    var record = this
      , then, wrapper;
    if(record.d)return;
    record.d = true;
    record = record.r || record; // unwrap
    try {
      if(then = isThenable(value)){
        wrapper = {r: record, d: false}; // wrap
        then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
      } else {
        record.v = value;
        record.s = 1;
        notify(record);
      }
    } catch(err){
      reject.call(wrapper || {r: record, d: false}, err); // wrap
    }
  }
  function reject(value){
    var record = this;
    if(record.d)return;
    record.d = true;
    record = record.r || record; // unwrap
    record.v = value;
    record.s = 2;
    notify(record, true);
  }
  function getConstructor(C){
    var S = assertObject(C)[SPECIES];
    return S != undefined ? S : C;
  }
  // 25.4.3.1 Promise(executor)
  Promise = function(executor){
    assertFunction(executor);
    var record = {
      p: assert.inst(this, Promise, PROMISE), // <- promise
      c: [],                                  // <- chain
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false                                // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx(resolve, record, 1), ctx(reject, record, 1));
    } catch(err){
      reject.call(record, err);
    }
  }
  $.mix(Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function(onFulfilled, onRejected){
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      } , P = react.P = new (S != undefined ? S : Promise)(function(resolve, reject){
        react.res = assertFunction(resolve);
        react.rej = assertFunction(reject);
      }), record = this[RECORD];
      record.c.push(react);
      record.s && notify(record);
      return P;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  $.mix(Promise, {
    // 25.4.4.1 Promise.all(iterable)
    all: function(iterable){
      var Promise = getConstructor(this)
        , values  = [];
      return new Promise(function(resolve, reject){
        forOf(iterable, false, values.push, values);
        var remaining = values.length
          , results   = Array(remaining);
        if(remaining)$.each.call(values, function(promise, index){
          Promise.resolve(promise).then(function(value){
            results[index] = value;
            --remaining || resolve(results);
          }, reject);
        });
        else resolve(results);
      });
    },
    // 25.4.4.4 Promise.race(iterable)
    race: function(iterable){
      var Promise = getConstructor(this);
      return new Promise(function(resolve, reject){
        forOf(iterable, false, function(promise){
          Promise.resolve(promise).then(resolve, reject);
        });
      });
    },
    // 25.4.4.5 Promise.reject(r)
    reject: function(r){
      return new (getConstructor(this))(function(resolve, reject){
        reject(r);
      });
    },
    // 25.4.4.6 Promise.resolve(x)
    resolve: function(x){
      return isObject(x) && RECORD in x && $.getProto(x) === this.prototype
        ? x : new (getConstructor(this))(function(resolve, reject){
          resolve(x);
        });
    }
  });
}();
cof.set(Promise, PROMISE);
require('./$.species')(Promise);
$def($def.G + $def.F * (Promise != Base), {Promise: Promise});