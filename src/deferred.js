!function(SET, CLEAR, ARGUMENTS, ID){
  function Deferred(set, clear, fn, args){
    unshift.call(args, fn);
    this[SET]       = set;
    this[CLEAR]     = clear;
    this[ARGUMENTS] = args;
    this[ID]        = 0;
  }
  Deferred[prototype].run = function(){
    var that = this;
    that[ID] && that.stop();
    that[ID] = that[SET].apply(global, that[ARGUMENTS]);
    return that;
  },
  Deferred[prototype].stop = function(){
    var that  = this
      , clear = that[CLEAR];
    that[ID] && clear(that[ID]);
    return that;
  }
  function createDeferredFactory(set, clear){
    return function(/* args... */){
      return new Deferred(set, clear, this, arguments).run();
    }
  }
  $define(PROTO, 'Function', {
    /**
     * Alternatives:
     * http://underscorejs.org/#delay
     * http://sugarjs.com/api/Function/delay
     * http://api.prototypejs.org/language/Function/prototype/delay/
     * http://mootools.net/docs/core/Types/Function#Function:delay
     */
    timeout: createDeferredFactory(setTimeout, clearTimeout),
    /**
     * Alternatives:
     * http://sugarjs.com/api/Function/every
     * http://mootools.net/docs/core/Types/Function#Function:periodical
     */
    interval: createDeferredFactory(setInterval, clearInterval),
    /**
     * Alternatives:
     * http://underscorejs.org/#defer
     * http://api.prototypejs.org/language/Function/prototype/defer/
     */
    immediate: createDeferredFactory(setImmediate, clearImmediate)
  });
}(symbol('set'), symbol('clear'), symbol('arguments'), symbol('id'));