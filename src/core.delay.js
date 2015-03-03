// https://esdiscuss.org/topic/promise-returning-delay-function
$def(GLOBAL + FORCED, {
  delay: function(time){
    return new Promise(function(resolve){
      setTimeout(partial.call(resolve, true), time);
    });
  }
});