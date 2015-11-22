require('./es6.array.iterator');
var global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag')
  , ArrayValues   = Iterators.Array;

require('./_').each.call((
  'CSSRuleList,CSSStyleDeclaration,DOMStringList,DOMTokenList,FileList,HTMLCollection,MediaList,' +
  'MimeTypeArray,NamedNodeMap,NodeList,NodeListOf,Plugin,PluginArray,StyleSheetList,TouchList'
).split(','), function(NAME){
  var Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = ArrayValues;
});