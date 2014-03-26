!function(escape){
  /**
   * https://gist.github.com/kangax/9698100
   * Alternatives:
   * http://sugarjs.com/api/String/escapeRegExp
   * http://api.prototypejs.org/language/RegExp/escape/
   * http://mootools.net/docs/core/Types/String#String:escapeRegExp
   */
  $define(STATIC, REGEXP, {
    escape: function(it){
      return String(it).replace(escape, '\\$1');
    }
  });
}(/([\\\-[\]{}()*+?.,^$|])/g);