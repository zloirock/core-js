/**
 * https://developer.mozilla.org/en-US/docs/Web/API/console
 * https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
 * Alternatives:
 * https://github.com/paulmillr/console-polyfill
 * https://github.com/theshock/console-cap
 */
var $console = reduceTo.call(
  array('assert,count,clear,debug,dir,dirxml,error,exception,' +
    'group,groupCollapsed,groupEnd,info,log,table,trace,warn,' +
    'markTimeline,profile,profileEnd,time,timeEnd,timeStamp'),
  {enabled: true},
  function(memo, key){
    memo[key] = function(){
      return console[key] && $console.enabled ? apply.call(console[key], console, arguments) : undefined;
    };
  }
);
try {
  delete global.console;
} catch(e){}
$define(GLOBAL, undefined, {console: $console = assign($console.log, $console)});