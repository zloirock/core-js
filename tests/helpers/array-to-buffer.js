var ArrayBuffer = global.core ? core.ArrayBuffer : global.ArrayBuffer;
var DataView = global.core ? core.DataView : global.DataView;
global.arrayToBuffer = function (it) {
  var buffer = new ArrayBuffer(it.length);
  var view = new DataView(buffer);
  for (var i = 0, length = it.length; i < length; ++i) {
    view.setUint8(i, it[i]);
  }
  return buffer;
};
