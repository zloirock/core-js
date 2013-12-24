function slice1(arrayLike){
  return slice.call(arrayLike, 1)
}
function indexSame(arrayLike, val){
  var i = 0
    , length = toLength(arrayLike.length)
  for(;i < length; i++)if(same(arrayLike[i], val))return i;
  return -1
}
function reduceTo(callbackfn, target){
  target = Object(target);
  forEach.call(arrayLikeSelf(this), callbackfn, target);
  return target
}