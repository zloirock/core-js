/**
 * ECMAScript 6 Symbol
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-symbol-objects
 * Alternatives:
 * http://webreflection.blogspot.com.au/2013/03/simulating-es6-symbols-in-es5.html
 * https://github.com/seanmonstar/symbol
 */
!function(TAG, SymbolRegistry){
  // 19.4.1 The Symbol Constructor
  function Symbol(description){
    if(!(this instanceof Symbol))return new Symbol(description);
    var tag = symbol(description);
    hidden(this, TAG, tag);
    defineProperty($Object, tag, {
      set: function(value){
        hidden(this, tag, value);
      }
    });
  }
  Symbol[prototype].toString = function(){
    return this[TAG];
  }
  $define(GLOBAL, {Symbol: Symbol});
  $define(STATIC, 'Symbol', {
    // 19.4.2.2 Symbol.for(key)
    'for': function(key){
      return has(SymbolRegistry, key) ? SymbolRegistry[key] : SymbolRegistry[key] = new Symbol(key);
    },
    // 19.4.2.6 Symbol.iterator
    iterator: ITERATOR,
    // 19.4.2.7 Symbol.keyFor(sym)
    keyFor: function(sym){
      for(var key in SymbolRegistry)if(has(SymbolRegistry, key) && SymbolRegistry[key] === sym)return key;
    }
  });
}(symbol('tag'), {});