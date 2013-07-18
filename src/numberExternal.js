extendBuiltInObject(Math,{
  div:function(number,divisor){
    var result=number/divisor;
    return(result>0?floor:ceil)(result)
  }
});
extendBuiltInObject($Number,{
  div:function(divisor){
    var result=this/divisor;
    return(result>0?floor:ceil)(result)
  },
  times:function(fn/*?*/,that){
    var i=0,num=this|0,result=Array(num);
    if(isFunction(fn))while(i<num)result[i]=fn.call(that,i++,this);
    return result
  },
  random:function(/*?*/number){
    var m=min(this||0,number||0);
    return random()*(max(this||0,number||0)-m)+m
  },
  rand:function(/*?*/number){
    var m=min(this||0,number||0);
    return floor((random()*(max(this||0,number||0)+1-m))+m)
  },
  odd:function(){
    return !(this%1)&&!!(this%2)
  },
  even:function(){
    return !!(+this+1)&&!(this%2)
  },
  format:methodize.call(numberFormat),
  toChar:methodize.call(String.fromCharCode)
});
extendBuiltInObject(
  $Number,
  'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,pow,sqrt,max,min,pow,atan2'
    .split(',').reduce(function(o,k){
      o[k]=methodize.call(Math[k]);
      return o
    },{})
);