!function(tmp){
  // 19.1.3.6 Object.prototype.toString()
  tmp[wks('toStringTag')] = 'z';
  if(cof(tmp) != 'z')$.hide(Object.prototype, 'toString', function(){
    return '[object ' + cof.classof(this) + ']';
  });
}({});