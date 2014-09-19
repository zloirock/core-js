!function(ARGUMENTS, ID){
  function createTaskFactory(set, clear){
    function Task(args){
      this[ID] = invoke(set, this[ARGUMENTS] = args);
    }
    setToStringTag(Task, 'Task');
    hidden(Task[PROTOTYPE], 'set', function(){
      clear(this[ID]);
      this[ID] = invoke(set, this[ARGUMENTS]);
      return this;
    });
    hidden(Task[PROTOTYPE], 'clear', function(){
      clear(this[ID]);
      return this;
    });
    return function(/* ...args */){
      var args = [assertFunction(this)]
        , i    = 0;
      while(arguments.length > i)args.push(arguments[i++]);
      return new Task(args);
    }
  }
  $define(PROTO, FUNCTION, {
    timeout:   createTaskFactory(setTimeout,   clearTimeout),
    interval:  createTaskFactory(setInterval,  clearInterval),
    immediate: createTaskFactory(setImmediate, clearImmediate)
  });
}(symbol('arguments'), symbol('id'));