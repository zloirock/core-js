function slice(start, end){
  var len    = this.byteLength
    , first  = toIndex(start, len)
    , final  = toIndex(end === undefined ? len : end, len)
    , result = new ArrayBuffer(toLength(final - first))
    , viewS  = new DataView(this)
    , viewT  = new DataView(result)
    , index  = 0;
  while(first < final){
    viewT.setUint8(index++, viewS.getUint8(first++));
  } return result;
}

var $def   = require('./$.def')
  , buffer = require('./$.buffer');

$def($def.G + $def.W + $def.F * !buffer.useNative, {ArrayBuffer: buffer.ArrayBuffer});