var _console=global.console||{},
    consoleMap='assert,count,debug,dir,dirxml,error,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,table,time,timeEnd,trace,warn'
      .split(',').reduce(function(result,key){
        result[key]=function(){
          _console[key]&&console.enable&&apply.call(_console[key],_console,arguments)
        };
        return result
      },{enable:true});
tryDeleteGlobal('console');
global.console=extendBuiltInObject(consoleMap.log,consoleMap);