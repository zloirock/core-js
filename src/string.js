!function(){
  var dictionaryEscapeHTML = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
        '/': '&#x2f;'
      }
    , dictionaryUnescapeHTML = invert(dictionaryEscapeHTML)
    , RegExpEscapeHTML = RegExp('[' + keys(dictionaryEscapeHTML).join('') + ']', 'g')
    , RegExpUnescapeHTML = RegExp('(' + keys(dictionaryUnescapeHTML).join('|') + ')', 'g')
    , RegExpEscapeRegExp = /([\\\/'*+?|()\[\]{}.^$])/g;
  $define(PROTO, 'String', {
    /**
     * Alternatives:
     * http://sugarjs.com/api/String/at
     */
    at: function(index){
      return String(this).charAt(0 > (index |= 0) ? this.length + index : index);
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#escape
     * http://sugarjs.com/api/String/escapeHTML
     * http://api.prototypejs.org/language/String/prototype/escapeHTML/
     */
    escapeHTML: function(){
      return String(this).replace(RegExpEscapeHTML, function(part){
        return dictionaryEscapeHTML[part];
      });
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#unescape
     * http://sugarjs.com/api/String/unescapeHTML
     * http://api.prototypejs.org/language/String/prototype/unescapeHTML/
     */
    unescapeHTML: function(){
      return String(this).replace(RegExpUnescapeHTML, function(part, key){
        return dictionaryUnescapeHTML[key];
      });
    },
    /**
     * Alternatives:
     * http://sugarjs.com/api/String/escapeURL
     */
    escapeURL: function(component /* = false */){
      return (component ? encodeURIComponent : encodeURI)(this);
    },
    /**
     * Alternatives:
     * http://sugarjs.com/api/String/unescapeURL
     */
    unescapeURL: function(component /* = false */){
      return (component ? decodeURIComponent : decodeURI)(this);
    },
    /**
     * Alternatives:
     * http://sugarjs.com/api/String/escapeRegExp
     * http://api.prototypejs.org/language/RegExp/escape/
     * http://mootools.net/docs/core/Types/String#String:escapeRegExp
     */
    escapeRegExp: function(){
      return String(this).replace(RegExpEscapeRegExp, '\\$1');
    }
  });
}();