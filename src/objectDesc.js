// http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
function getPropertyNames(object){
  var i,length,names,key,
      result=getOwnPropertyNames(object);
  while(object=getPrototypeOf(object)){
    i=0,names=getOwnPropertyNames(object),length=names.length;
    while(length > i)~result.indexOf(key=names[i++])||result.push(key)
  }
  return result
}
// http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
function getPropertyDescriptor(object,key){
  if(key in object)do{
    if(own(object,key))return getOwnPropertyDescriptor(object,key)
  }while(object=getPrototypeOf(object))
}
// http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
function getOwnPropertyDescriptors(object){
  var result={},
      names=getOwnPropertyNames(object),
      key,i=0,length=names.length;
  while(length > i)result[key=names[i++]]=getOwnPropertyDescriptor(object,key);
  return result
}
// http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
function getPropertyDescriptors(object){
  var i,length,names,key,
      result=getOwnPropertyDescriptors(object);
  while(object=getPrototypeOf(object)){
    names=getOwnPropertyNames(object);
    i=0;length=names.length;
    while(length > i)if(!own(result,key=names[i++]))result[key]=getOwnPropertyDescriptor(object,key);
  }
  return result
}