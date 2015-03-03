!function(NodeList){
  var SYMBOL_ITERATOR = wks('iterator');
  if(framework && NodeList && !(SYMBOL_ITERATOR in NodeList.prototype)){
    $.hide(NodeList.prototype, SYMBOL_ITERATOR, Iter.Iterators.Array);
  }
  Iter.Iterators.NodeList = Iter.Iterators.Array;
}($.g.NodeList);