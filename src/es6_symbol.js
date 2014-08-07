/**
 * ECMAScript 6 Symbol
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-symbol-objects
 * http://webreflection.blogspot.com.au/2013/03/simulating-es6-symbols-in-es5.html
 */
!function(TAG, $ITERATOR, $TOSTRINGTAG, SymbolRegistry){
  // 19.4.1.1 Symbol([description])
  if(!isNative(Symbol)){
    Symbol = function(description){
      if(this instanceof Symbol)throw new TypeError('Symbol is not a constructor');
      var tag = uid(description);
      defineProperty($Object, tag, {
        configurable: true,
        set: function(value){
          hidden(this, tag, value);
        }
      });
      return hidden(create(Symbol[PROTOTYPE]), TAG, tag);
    }
    hidden(Symbol[PROTOTYPE], TO_STRING, function(){
      return this[TAG];
    });
  }
  ITERATOR = $ITERATOR in Symbol
    ? Symbol[$ITERATOR]
    : uid(SYMBOL + '.' + $ITERATOR);
  TOSTRINGTAG = $TOSTRINGTAG in Symbol
    ? Symbol[$TOSTRINGTAG]
    : Symbol(SYMBOL + '.' + $TOSTRINGTAG);
  $define(GLOBAL, {Symbol: wrapGlobalConstructor(Symbol)}, 1);
  $define(STATIC, SYMBOL, {
    // 19.4.2.2 Symbol.for(key)
    'for': function(key){
      var k = '' + key;
      return has(SymbolRegistry, k) ? SymbolRegistry[k] : SymbolRegistry[k] = Symbol(k);
    },
    // 19.4.2.6 Symbol.iterator
    iterator: ITERATOR,
    // 19.4.2.7 Symbol.keyFor(sym)
    keyFor: function(sym){
      return keyOf(SymbolRegistry, sym);
    },
    // 19.4.2.10 Symbol.toStringTag
    toStringTag: TOSTRINGTAG,
    pure: symbol,
    set: set
  });
  setToStringTag(Symbol, SYMBOL);
}(symbol('tag'), 'iterator', TO_STRING + 'Tag', {});