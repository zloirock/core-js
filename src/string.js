!function(){
  var escapeHTMLDict = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;'
      }
    , unescapeHTMLDict = transform.call(keys(escapeHTMLDict), function(memo, key){
        memo[escapeHTMLDict[key]] = key;
      })
    , RegExpEscapeHTML   = /[&<>"']/g
    , RegExpUnescapeHTML = RegExp('(' + keys(unescapeHTMLDict).join('|') + ')', 'g');
  $define(PROTO, STRING, {
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
        return escapeHTMLDict[part];
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
        return unescapeHTMLDict[key];
      });
    }
  });
}();