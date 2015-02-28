!function(NodeList){
  if(framework && NodeList && !(SYMBOL_ITERATOR in NodeList.prototype)){
    hidden(NodeList.prototype, SYMBOL_ITERATOR, Iterators.Array);
  }
  Iterators.NodeList = Iterators.Array;
}(global.NodeList);