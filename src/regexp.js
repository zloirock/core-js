!function(escapeRegExp){
  // ~ES7 : https://gist.github.com/kangax/9698100
  $define(STATIC, REGEXP, {
    escape: function(it){
      return String(it).replace(escapeRegExp, '\\$1');
    }
  });
}(/([\\\-[\]{}()*+?.,^$|])/g);