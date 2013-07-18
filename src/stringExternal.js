extendBuiltInObject($String,{
  // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/trimLeft
  trimLeft:function(){
    return replace.call(this,LTrim,'')
  },
  // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/trimRight
  trimRight:function(){
    return replace.call(this,RTrim,'')
  },
  assign:function(props/*args...*/){
    props=isObject(props)?props:toArray(arguments);
    return replace.call(this,/\{([^{]+)\}/g,function(part,key){
      return own(props,key)?props[key]:part
    })
  },
  escapeHTML:function(){
    return replace
      .call(this,/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&apos;')
        .replace(/\//g,'&#x2f;')
  },
  unescapeHTML:function(){
    return replace
      .call(this,/&lt;/g,'<')
        .replace(/&gt;/g,'>')
        .replace(/&quot;/g,'"')
        .replace(/&apos;/g,"'")
        .replace(/&#x2f;/g,'/')
        .replace(/&amp;/g,'&')
  },
  escapeURL:function(/*?*/component){
    return (component?encodeURIComponent:encodeURI)(this)
  },
  unescapeURL:function(/*?*/component){
    return (component?decodeURIComponent:decodeURI)(this)
  },
  escapeRegExp:function escapeRegExp(){
    return replace.call(this,/([\\\/'*+?|()\[\]{}.^$])/g,'\\$1')
  },
  reverse:function(){
    return (''+this).split('').reverse().join('')
  },
  empty:function(){
    return !(''+this).trim()
  },
  last:function(){
    return (''+this).charAt(this.length-1)
  }/* ??? */,
  test:function(regExp){
    return isRegExp(regExp)?regExp.test(this):false
  },
  add:function(str/*?*/,pos){
    var that=''+this;
    return pos==undefined?that+str:that.slice(0,pos)+str+that.slice(pos)
  }
});