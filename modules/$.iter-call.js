var anObject = require('./$.an-object');
function close(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)anObject(ret.call(iterator));
}
function call(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  } catch(e){
    close(iterator);
    throw e;
  }
}
call.close = close;
module.exports = call;