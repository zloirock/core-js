var $iterators     = require('./es6.array.iterator')
  , redefine       = require('./$.redefine')
  , global         = require('./$.global')
  , hide           = require('./$.hide')
  , Iterators      = require('./$.iterators')
  , wks            = require('./$.wks')
  , CORRECT_SYMBOL = require('./$.correct-symbol')
  , ITERATOR       = wks('iterator')
  , TO_STRING_TAG  = wks('toStringTag')
  , ArrayValues    = Iterators.Array;

require('./$').each.call((
  'CSSRuleList,CSSStyleDeclaration,DOMStringList,DOMTokenList,FileList,HTMLCollection,MediaList,' +
  'MimeTypeArray,NamedNodeMap,NodeList,NodeListOf,Plugin,PluginArray,StyleSheetList,TouchList'
).split(','), function(NAME){
  var Collection = global[NAME]
    , proto      = Collection && Collection.prototype
    , key;
  if(proto){
    if(!proto[ITERATOR])hide(proto, ITERATOR, ArrayValues);
    if(!proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    for(key in $iterators){
      if(!CORRECT_SYM || !proto[key])redefine(proto, key, $iterators[key], true);
    }
  }
});