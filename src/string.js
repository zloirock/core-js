!function(){
  var LTrimRegExp = RegExp(LTrim)
    , RTrimRegExp = RegExp(RTrim)
    , dictionaryEscapeHTML = {
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
  extendBuiltInObject($String, {
    // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/trimLeft
    trimLeft: function(){
      return String(this).replace(LTrimRegExp, '')
    },
    // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/trimRight
    trimRight: function(){
      return String(this).replace(RTrimRegExp, '')
    },
    escapeHTML: function(){
      return String(this).replace(RegExpEscapeHTML, function(part){
        return dictionaryEscapeHTML[part];
      })
    },
    unescapeHTML: function(){
      return String(this).replace(RegExpUnescapeHTML, function(part, key){
        return dictionaryUnescapeHTML[key];
      })
    },
    escapeURL: function(component /* = false */){
      return (component ? encodeURIComponent : encodeURI)(this)
    },
    unescapeURL: function(component /* = false */){
      return (component ? decodeURIComponent : decodeURI)(this)
    },
    escapeRegExp: function(){
      return String(this).replace(RegExpEscapeRegExp, '\\$1')
    },
    reverse: function(){
      return String(this).split('').reverse().join('')
    },
    at: function(index){
      var that = String(this);
      return that.charAt(index < 0 ? that.length + index : index)
    }
  });
}();