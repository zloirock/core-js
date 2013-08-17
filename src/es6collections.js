if(!isNative(global.Map)||!['set','get','delete','clear','forEach'].every(own.bind(undefined,Map[prototype]))){
  tryDeleteGlobal('Map');
  global.Map=function(iterable){
    var key,value,that=this;
    if(!(that instanceof Map))return new Map(iterable);
    that.clear();
    if(isMap(iterable)||isSet(iterable))iterable.forEach(function(value){that.set(value[0],value[1])});
    else if(isObject(iterable))for(key in iterable)that.set((value=iterable[key])[0],value[1]);
  }
  extendBuiltInObject(Map[prototype],{
    // 15.14.4.2 Map.prototype.clear ()
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.14.4.2
    clear:function(){
      defineProperties(this,{_keys:{value:[],writable:true},_values:{value:[],writable:true}});
      this.size=0
    },
    // 15.14.4.3 Map.prototype.delete ( key )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.14.4.3
    'delete':function(key){
      var keys=this._keys,
          values=this._values,
          index=indexSame(keys,key);
      if(~index){
        keys.splice(index,1);
        values.splice(index,1);
        this.size=values.length;
        return true
      }
      return false
    },
    // 15.14.4.4 Map.prototype.forEach ( callbackfn , thisArg = undefined )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.14.4.4
    forEach:function(callbackfn/*?*/,thisArg){
      var keys=this._keys,
          values=this._values,
          i=0,length=values.length;
      while(length > i)callbackfn.call(thisArg,values[i],keys[i++],this)
    },
    // 15.14.4.5 Map.prototype.get ( key )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.14.4.5
    get:function(key){
      return this._values[indexSame(this._keys,key)]
    },
    // 15.14.4.6 Map.prototype.has ( key )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.14.4.6
    has:function(key){
      return !!~indexSame(this._keys,key)
    },
    // 15.14.4.9 Map.prototype.set ( key , value )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.14.4.9
    set:function(key,value){
      var keys=this._keys,
          values=this._values,
          index=indexSame(keys,key);
      if(!~index){
        keys.push(key);
        values.push(value);
        this.size=values.length
      }
      else values[index]=value;
      return this
    }
  });
  isMap=function(it){return it instanceof Map}
}
if(!isNative(global.Set)||!['add','delete','clear','has','forEach'].every(own.bind(undefined,Set[prototype]))){
  tryDeleteGlobal('Set');
  global.Set=function(iterable){
    if(!(this instanceof Set))return new Set(iterable);
    this.clear();
    if(isMap(iterable)||isSet(iterable))iterable.forEach(this.add,this);
    else if(isObject(iterable))for(var key in iterable)this.add(iterable[key]);
  };
  extendBuiltInObject(Set[prototype],{
    // 15.16.4.2 Set.prototype.add (value )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.16.4.2
    add:function(value){
      var values=this.SetData;
      if(!~indexSame(values,value)){
        values.push(value);
        this.size=values.length
      }
      return this
    },
    // 15.16.4.3 Set.prototype.clear ()
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.16.4.3
    clear:function(){
      defineProperty(this,'SetData',{value:[],writable:true});
      this.size=0
    },
    // 15.16.4.4 Set.prototype.delete ( value )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.16.4.4
    'delete':function(value){
      var values=this.SetData,
          index=indexSame(values,value);
      if(~index){
        values.splice(index,1);
        this.size=values.length;
        return true
      }
      return false
    },
    // 15.16.4.6 Set.prototype.forEach ( callbackfn , thisArg = undefined )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.16.4.6
    forEach:function(callbackfn/*?*/,thisArg){
      var values=this.SetData,val,
          i=0,length=values.length;
      while(length > i)callbackfn.call(thisArg,val=values[i++],val,this)
    },
    // 15.16.4.7 Set.prototype.has ( value )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.16.4.7
    has:function(value){
      return !!~indexSame(this.SetData,value)
    }
  });
  isSet=function(it){return it instanceof Set}
}