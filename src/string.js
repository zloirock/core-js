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
      }, {});
  $define(PROTO, STRING, {
    escapeHTML:   createEscaper(/[&<>"']/g, escapeHTMLDict),
    unescapeHTML: createEscaper(/&(?:amp|lt|gt|quot|apos);/g, unescapeHTMLDict)
  });
}();