function slice1(arrayLike){
  return slice.call(arrayLike,1)
}
function indexSame(arrayLike,val){
  for(var i=0,length=arrayLike.length;i<length;i++)if(same(arrayLike[i],val))return i;
  return -1
}
function props(key){
  key+='';
  var that=arrayLikeSelf(this),
      length=that.length,i=0,
      result=Array(length);
  for(;i<length;i++)if(i in that)result[i]=that[i][key];
  return result
}
function unique(/*?*/mapArg){
  var result=[],
      that=createMap(this,mapArg),
      i=0,length=that.length|0,value;
  while(length > i)~indexSame(result,value=that[i++])||result.push(value);
  return result
}
// http://wiki.ecmascript.org/doku.php?id=strawman:array_fill_and_move
function fill(value/*?*/,start,count){
  var end,length=this.length|0;
  if((start|=0)<0&&(start=length+start)<0)return this;
  end=count==undefined?length:start+count|0;
  while(start<end)this[start++]=value;
  return this
}
function createMap(that,foo){
  switch(isClass(foo)){
    case'Function':return map.call(that,foo);
    case'String':case'Number':return props.call(that,foo)
  }
  return arrayLikeSelf(that)
}