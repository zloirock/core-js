// Wrapers for piping in LiveScript
extendBuiltInObject(Object,{ls:getOwnPropertyNames(Object).reduce(function(o,key,fn){
  if(isFunction(fn=Object[key]))o[key]=function(){
    var args=toArray(arguments);
    return function(x){return fn.apply(undefined,[x].concat(args))}}
  return o
},{})});
extendBuiltInObject(Array,{ls:getOwnPropertyNames(Array).reduce(function(o,key,fn){
  if(isFunction(fn=Array[key]))o[key]=function(){
    var args=toArray(arguments);
    return function(x){return fn.apply(undefined,[x].concat(args))}}
  return o
},{})});
extendBuiltInObject(String,{ls:getOwnPropertyNames(String[prototype]).reduce(function(o,key,fn){
  if(isFunction(fn=String[prototype][key]))o[key]=function(){
    var args=arguments;
    return function(x){return fn.apply(x,args)}}
  return o
},{})});
extendBuiltInObject(Function,{ls:getOwnPropertyNames(Function[prototype]).reduce(function(o,key,fn){
  if(isFunction(fn=Function[prototype][key]))o[key]=function(){
    var args=arguments;
    return function(x){return fn.apply(x,args)}}
  return o
},{})});