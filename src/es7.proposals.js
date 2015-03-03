!function(){
  $def(PROTO, 'Array', {
    // https://github.com/domenic/Array.prototype.includes
    includes: createArrayIncludes(true)
  });
  $def(PROTO, 'String', {
    // https://github.com/mathiasbynens/String.prototype.at
    at: createPointAt(true)
  });
  
  function createObjectToArray(isEntries){
    return function(object){
      var O      = $.toObject(object)
        , keys   = $.getKeys(object)
        , length = keys.length
        , i      = 0
        , result = Array(length)
        , key;
      if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
      else while(length > i)result[i] = O[keys[i++]];
      return result;
    }
  }
  $def(STATIC, 'Object', {
    // https://gist.github.com/WebReflection/9353781
    getOwnPropertyDescriptors: function(object){
      var O      = $.toObject(object)
        , result = {};
      $.each.call($.ownKeys(O), function(key){
        $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
      });
      return result;
    },
    // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues
    values:  createObjectToArray(false),
    entries: createObjectToArray(true)
  });
  $def(STATIC, 'RegExp', {
    // https://gist.github.com/kangax/9698100
    escape: createReplacer(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
  });
}();