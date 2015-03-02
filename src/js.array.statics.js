// JavaScript 1.6 / Strawman array statics shim
!function(arrayStatics, A){
  function setArrayStatics(keys, length){
    forEach.call(array(keys), function(key){
      if(key in A)arrayStatics[key] = ctx(Function.call, A[key], length);
    });
  }
  setArrayStatics('pop,reverse,shift,keys,values,entries', 1);
  setArrayStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
  setArrayStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
                  'reduce,reduceRight,copyWithin,fill,turn');
  $define(STATIC, 'Array', arrayStatics);
}({}, []);