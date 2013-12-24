var _console = global.console || {}
  // https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
  , $console = reduceTo.call(
      splitComma('assert,count,clear,debug,dir,dirxml,error,exception,' +
        'group,groupCollapsed,groupEnd,info,log,table,trace,warn,markTimeline,profile,' +
        'profileEnd,time,timeEnd,timeStamp'),
      function(key){
          this[key] = function(){
            return _console[key] && $console.enable && apply.call(_console[key], _console, arguments)
          };
        },
      {enable: true});
try {
  delete global.console
} catch(e){}
$console = global.console = extendBuiltInObject($console.log, $console);