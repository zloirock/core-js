/**
 * https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
 * https://developer.mozilla.org/en-US/docs/Web/API/console
 * Alternatives:
 * https://github.com/paulmillr/console-polyfill
 * https://github.com/theshock/console-cap
 */
!function(console){
  var $console = turn.call(
    array('assert,count,clear,debug,dir,dirxml,error,exception,' +
      'group,groupCollapsed,groupEnd,info,log,table,trace,warn,' +
      'markTimeline,profile,profileEnd,time,timeEnd,timeStamp'),
    function(memo, key){
      memo[key] = function(){
        if(enabled && console[key])return apply.call(console[key], console, arguments);
      };
    },
    {
      enable: function(){
        enabled = true;
      },
      disable: function(){
        enabled = false;
      }
    }
  ), enabled = true;
  try {
    framework && delete global.console;
  } catch(e){}
  $define(GLOBAL, {console: assign($console.log, $console)}, 1);
}(global.console || {});