!function(tmp){
  // 19.1.3.6 Object.prototype.toString()
  tmp[SYMBOL_TAG] = 'z';
  if(cof(tmp) != 'z')hidden(ObjectProto, 'toString', function(){
    return '[object ' + classof(this) + ']';
  });
}({});