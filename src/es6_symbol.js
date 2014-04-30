/**
 * ECMAScript 6 Symbol
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-symbol-objects
 * Alternatives:
 * http://webreflection.blogspot.com.au/2013/03/simulating-es6-symbols-in-es5.html
 * https://github.com/seanmonstar/symbol
 */
!function(Symbol, TAG, SymbolRegistry, FFITERATOR){
  // 19.4.1 The Symbol Constructor
  if(!isNative(Symbol)){
    Symbol = function(description){
      if(!(this instanceof Symbol))return new Symbol(description);
      var tag = symbol(description);
      defineProperty($Object, tag, {
        set: function(value){
          hidden(this, tag, value);
        }
      });
      hidden(this, TAG, tag);
    }
    Symbol[PROTOTYPE].toString = Symbol[PROTOTYPE].valueOf = function(){
      return this[TAG];
    }
  }
  $define(GLOBAL, {Symbol: wrapGlobalConstructor(Symbol)}, 1);
  $define(STATIC, 'Symbol', {
    // 19.4.2.2 Symbol.for(key)
    'for': function(key){
      return has(SymbolRegistry, key) ? SymbolRegistry[key] : SymbolRegistry[key] = Symbol(key);
    },
    // 19.4.2.6 Symbol.iterator
    iterator: ITERATOR = Symbol.iterator || FFITERATOR in $Array ? FFITERATOR : Symbol('Symbol.iterator'),
    // 19.4.2.7 Symbol.keyFor(sym)
    keyFor: function(sym){
      for(var key in SymbolRegistry)if(SymbolRegistry[key] === sym)return key;
    },
    // 19.4.2.10 Symbol.toStringTag
    toStringTag: TOSTRINGTAG = Symbol.toStringTag || Symbol('Symbol.toStringTag')
  });
  Symbol[PROTOTYPE][TOSTRINGTAG] = 'Symbol';
}(global.Symbol, symbol('tag'), {}, '@@iterator');