!function(cap){
  forEach.call(array(CONSOLE_METHODS), function(key){
    cap[key] = function(){};
  });
  $define(GLOBAL, {console: {}});
  $define(STATIC + SIMPLE, 'console', cap);
}({});