require('./es6.array.iterator');
var global        = require('./_global')
  , getKeys       = require('./_object-keys')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag');

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  DOMTokenList: true,
  MediaList: true, // TODO: Not spec compliant, should be false.
  NodeList: true,
  StyleSheetList: true // TODO: Not spec compliant, should be false.
};

for(var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}