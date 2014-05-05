/**
 * Alternatives:
 * http://sugarjs.com/api/Function/delay
 * http://sugarjs.com/api/Function/every
 * http://api.prototypejs.org/language/Function/prototype/delay/
 * http://api.prototypejs.org/language/Function/prototype/defer/
 * http://mootools.net/docs/core/Types/Function#Function:delay
 * http://mootools.net/docs/core/Types/Function#Function:periodical
 */
!function(ARGUMENTS, ID){
  function createDeferredFactory(set, clear){
    function Deferred(args){
      this[ID] = set.apply(global, this[ARGUMENTS] = args)
    }
    Deferred[PROTOTYPE].set = function(){
      clear(this[ID]);
      this[ID] = set.apply(global, this[ARGUMENTS]);
      return this;
    }
    Deferred[PROTOTYPE].clear = function(){
      clear(this[ID]);
      return this;
    }
    return function(/* ...args */){
      assertFunction(this);
      var args = [this], i = 0;
      while(arguments.length > i)args.push(arguments[i++]);
      return new Deferred(args);
    }
  }
  $define(PROTO, FUNCTION, {
    timeout:   createDeferredFactory(setTimeout, clearTimeout),
    interval:  createDeferredFactory(setInterval, clearInterval),
    immediate: createDeferredFactory(setImmediate, clearImmediate)
  });
}(symbol('arguments'), symbol('id'));