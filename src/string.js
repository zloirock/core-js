!function(){
  var escapeHTMLDict = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;'
      }
    , unescapeHTMLDict = turn.call(getKeys(escapeHTMLDict), function(memo, key){
        memo[escapeHTMLDict[key]] = key;
      }, {})
    , escapeHTMLRegExp   = /[&<>"']/g
    , unescapeHTMLRegExp = /&(?:amp|lt|gt|quot|apos);/g;
  $define(PROTO, STRING, {
    escapeHTML: function(){
      return String(this).replace(escapeHTMLRegExp, function(part){
        return escapeHTMLDict[part];
      });
    },
    unescapeHTML: function(){
      return String(this).replace(unescapeHTMLRegExp, function(part){
        return unescapeHTMLDict[part];
      });
    }
  });
}();