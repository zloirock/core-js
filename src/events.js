extendBuiltInObject(Function,{EventEmitter:function(){
    var events={};
    this.on=function(event,fn/*?*/,that){
      (own(events,event)?events[event]:(events[event]=[])).push([fn,that,/*once*/false]);
      return this;
    };
    this.once=function(event,fn/*?*/,that){
      (own(events,event)?events[event]:(events[event]=[])).push([fn,that,/*once*/true]);
      return this;
    };
    this.off=function(/*?*/event,fn){
      if(!event)events={};
      else if(!fn)events[event]=[];
      else for(var listeners=own(events,event)?events[event]:$Array,i=0;i<listeners.length;++i)
        listeners[i][0]===fn&&listeners.splice(i--,1);
      return this
    };
    this.run=function(event,args){
      isObject(args)||(args=$Array);
      var listener,i=0,
          listeners=own(events,event)?events[event]:$Array;
      for(;i<listeners.length;++i){
        (listener=listeners[i])[0].apply(listener[1]||this,args);
        listener[2]&&listeners.splice(i--,1);
      }
      return this
    };
  }
});