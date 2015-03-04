var $               = require('./$')
  , Iter            = require('./$.iter')
  , SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , NodeList        = $.g.NodeList;
if($.framework && NodeList && !(SYMBOL_ITERATOR in NodeList.prototype)){
  $.hide(NodeList.prototype, SYMBOL_ITERATOR, Iter.Iterators.Array);
}
Iter.Iterators.NodeList = Iter.Iterators.Array;