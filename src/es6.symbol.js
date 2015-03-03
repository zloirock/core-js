// ECMAScript 6 symbols shim
!function(Symbol, shim, TAG, SymbolRegistry, AllSymbols, setter){
  // 19.4.1.1 Symbol([description])
  if(!$.isFunction(Symbol)){
    shim = 1;
    Symbol = function(description){
      assert(!(this instanceof Symbol), 'Symbol is not a constructor');
      var tag = uid(description)
        , sym = $.set($.create(Symbol.prototype), TAG, tag);
      AllSymbols[tag] = sym;
      $.DESC && setter && $.setDesc(Object.prototype, tag, {
        configurable: true,
        set: function(value){
          $.hide(this, tag, value);
        }
      });
      return sym;
    }
    $.hide(Symbol.prototype, 'toString', function(){
      return this[TAG];
    });
  }
  $def(GLOBAL + WRAP, {Symbol: Symbol});
    
  var symbolStatics = {
    // 19.4.2.1 Symbol.for(key)
    'for': function(key){
      return $.has(SymbolRegistry, key += '')
        ? SymbolRegistry[key]
        : SymbolRegistry[key] = Symbol(key);
    },
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: partial.call(keyOf, SymbolRegistry, 0),
    pure: uid.safe,
    set: $.set,
    useSetter: function(){ setter = true },
    useSimple: function(){ setter = false }
  };
  // 19.4.2.2 Symbol.hasInstance
  // 19.4.2.3 Symbol.isConcatSpreadable
  // 19.4.2.4 Symbol.iterator
  // 19.4.2.6 Symbol.match
  // 19.4.2.8 Symbol.replace
  // 19.4.2.9 Symbol.search
  // 19.4.2.10 Symbol.species
  // 19.4.2.11 Symbol.split
  // 19.4.2.12 Symbol.toPrimitive
  // 19.4.2.13 Symbol.toStringTag
  // 19.4.2.14 Symbol.unscopables
  $.each.call($.a('hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'),
    function(it){
      symbolStatics[it] = wks(it);
    }
  );
  
  $def(STATIC, 'Symbol', symbolStatics);
  
  cof.set(Symbol, 'Symbol');
  
  $def(STATIC + FORCED * shim, 'Object', {
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: function(it){
      var names = $.getNames($.toObject(it)), result = [], key, i = 0;
      while(names.length > i)$.has(AllSymbols, key = names[i++]) || result.push(key);
      return result;
    },
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: function(it){
      var names = $.getNames($.toObject(it)), result = [], key, i = 0;
      while(names.length > i)$.has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
      return result;
    }
  });
  
  // 20.2.1.9 Math[@@toStringTag]
  cof.set(Math, 'Math', true);
  // 24.3.3 JSON[@@toStringTag]
  cof.set($.g.JSON, 'JSON', true);
}($.g.Symbol, 0, uid.safe('tag'), {}, {}, true);