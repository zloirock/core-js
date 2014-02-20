/**
 * ECMAScript 6 Symbol
 * http://people.mozilla.org/~jorendorff/es6-draft.html
 * Alternatives:
 * https://github.com/seanmonstar/symbol
 * https://github.com/component/symbol
 * https://github.com/anthonyshort/symbol
 */
if(!isNative(global.Symbol)){
  global.Symbol = function(description){
    var tag = symbol(description);
    defineProperty($Object, tag, {set: function(value){
      hidden(this, tag, value);
      return value;
    }});
    return {toString: function(){
      return tag;
    }};
  };
};