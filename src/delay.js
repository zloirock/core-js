// https://esdiscuss.org/topic/promise-returning-delay-function
$define(GLOBAL + FORCED, {
  delay: function(time){
    return new Promise(function(resolve){
      setTimeout(resolve, time, true);
    });
  }
});