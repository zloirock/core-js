var $iterators    = require('./es6.array.iterator')
  , $export       = require('./$.export')
  , global        = require('./$.global')
  , hide          = require('./$.hide')
  , Iterators     = require('./$.iterators')
  , wks           = require('./$.wks')
  , ITERATOR      = wks('iterator')
  , TO_STRING_TAG = wks('toStringTag')
  , ArrayValues   = Iterators.Array;

require('./$').each.call((
  'CSSRuleList,CSSStyleDeclaration,DOMStringList,DOMTokenList,FileList,HTMLCollection,MediaList,' +
  'MimeTypeArray,NamedNodeMap,NodeList,NodeListOf,Plugin,PluginArray,StyleSheetList,TouchList'
).split(','), function(NAME){
  var Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto){
    if(!proto[ITERATOR])hide(proto, ITERATOR, ArrayValues);
    if(!proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    $export($export.P, NAME, $iterators);
  }
});