// partiall apply
function part(/*args...*/){
  var fn=this,
      i=0,length1=arguments.length,
      args1=Array(length);
  while(length1 > i)args1[i]=arguments[i++];
  return function(/*args...*/){
    var args2=args1.slice(),
        length2=arguments.length,i=0;
    while(length2 > i)args2[length1+i]=arguments[i++];
    return apply.call(fn,this,args2)
  }
}
// unbind method from context
function unbind(){
  return call.bind(this)
}
// add `this` as first argument
// Number.prototype.pow=Math.pow.methodize();
// 16..pow(2); //=>256
function methodize(){
  var fn=this;
  return function(/*args...*/){
    var i=0,length=arguments.length,
        args=Array(length+1);
    args[0]=this;
    while(length > i)args[i+1]=arguments[i++];
    return apply.call(fn,this,args)
  }
}