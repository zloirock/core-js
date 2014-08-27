/**
 * ECMAScript 6 Symbol
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-symbol-objects
 */
!function(TAG, $ITERATOR, $TOSTRINGTAG, SymbolRegistry){
  // 19.4.1.1 Symbol([description])
  if(!isNative(Symbol)){
    Symbol = function(description){
      assert(!(this instanceof Symbol), SYMBOL + ' is not a ' + CONSTRUCTOR);
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
  $define(GLOBAL + WRAP, {Symbol: Symbol});
  $define(STATIC, SYMBOL, {
    // 19.4.2.2 Symbol.for(key)
    'for': function(key){
      var k = '' + key;
      return has(SymbolRegistry, k) ? SymbolRegistry[k] : SymbolRegistry[k] = Symbol(k);
    },
    // 19.4.2.6 Symbol.iterator
    iterator: ITERATOR,
    // 19.4.2.7 Symbol.keyFor(sym)
    keyFor: part.call(keyOf, SymbolRegistry),
    // 19.4.2.10 Symbol.toStringTag
    toStringTag: TOSTRINGTAG,
    pure: symbol,
    set: set
  });
  setToStringTag(Symbol, SYMBOL);
}(symbol('tag'), 'iterator', TO_STRING + 'Tag', {});