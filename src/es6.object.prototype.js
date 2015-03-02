!function(tmp){
  // 19.1.3.6 Object.prototype.toString()
  tmp[getWellKnownSymbol('toStringTag')] = 'z';
  if(cof(tmp) != 'z')hidden(Object.prototype, 'toString', function(){
    return '[object ' + classof(this) + ']';
  });
}({});