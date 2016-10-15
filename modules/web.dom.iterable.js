var $iterators    = require('./es6.array.iterator')
  , getKeys       = require('./_object-keys')
  , redefine      = require('./_redefine')
  , global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , wks           = require('./_wks')
  , ITERATOR      = wks('iterator')
  , TO_STRING_TAG = wks('toStringTag')
  , ArrayValues   = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  DOMTokenList: true,
  MediaList: true, // TODO: Not spec compliant, should be false.
  NodeList: true,
  StyleSheetList: true // TODO: Not spec compliant, should be false.
};

for(var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++){
  var NAME       = collections[i]
    , explicit   = DOMIterables[NAME]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype
    , key;
  if(proto){
    if(!proto[ITERATOR])hide(proto, ITERATOR, ArrayValues);
    if(!proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit)for(key in $iterators)if(!proto[key])redefine(proto, key, $iterators[key], true);
  }
}