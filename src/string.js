!function(){
  var escapeHTMLDict = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  }, unescapeHTMLDict = {}, key;
  for(key in escapeHTMLDict)unescapeHTMLDict[escapeHTMLDict[key]] = key;
  $define(PROTO, STRING, {
    escapeHTML:   createEscaper(/[&<>"']/g, escapeHTMLDict),
    unescapeHTML: createEscaper(/&(?:amp|lt|gt|quot|apos);/g, unescapeHTMLDict)
  });
}();