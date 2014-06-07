/**
 * ECMAScript 6 Symbol
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-symbol-objects
 * Alternatives:
 * http://webreflection.blogspot.com.au/2013/03/simulating-es6-symbols-in-es5.html
 * https://github.com/seanmonstar/symbol
 */
!function(Symbol, SYMBOL, TAG, SymbolRegistry, FFITERATOR, $ITERATOR, $TOSTRINGTAG){
  // 19.4.1 The Symbol Constructor
  if(!isNative(Symbol)){
    Symbol = function(description){
      if(!(this instanceof Symbol))return new Symbol(description);
      var tag = symbol(description);
      defineProperty($Object, tag, {
        configurable: true,
        set: function(value){
          hidden(this, tag, value);
        }
      });
      hidden(this, TAG, tag);
    }
    Symbol[PROTOTYPE].toString = function(){
      return this[TAG];
    }
  }
  $define(GLOBAL, {Symbol: wrapGlobalConstructor(Symbol)}, 1);
  $define(STATIC, SYMBOL, {
    // 19.4.2.2 Symbol.for(key)
    'for': function(key){
      var k = '' + key;
      return has(SymbolRegistry, k) ? SymbolRegistry[k] : SymbolRegistry[k] = Symbol(k);
    },
    // 19.4.2.6 Symbol.iterator
    iterator: ITERATOR = $ITERATOR in Symbol ? Symbol[$ITERATOR] : FFITERATOR in $Array ? FFITERATOR : symbol(SYMBOL + '.' + $ITERATOR),
    // 19.4.2.7 Symbol.keyFor(sym)
    keyFor: function(sym){
      for(var key in SymbolRegistry)if(SymbolRegistry[key] === sym)return key;
    },
    // 19.4.2.10 Symbol.toStringTag
    toStringTag: TOSTRINGTAG = $TOSTRINGTAG in Symbol ? Symbol[$TOSTRINGTAG] : Symbol(SYMBOL + '.' + $TOSTRINGTAG)
  });
  setToStringTag(Symbol, SYMBOL);
}(global.Symbol, 'Symbol', symbol('tag'), {}, '@@iterator', 'iterator', 'toStringTag');