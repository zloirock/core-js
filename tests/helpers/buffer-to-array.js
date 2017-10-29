var DataView = global.core ? core.DataView : global.DataView;
global.bufferToArray = function (it) {
  var results = [];
  var view = new DataView(it);
  for (var i = 0, byteLength = view.byteLength; i < byteLength; ++i) {
    results.push(view.getUint8(i));
  }
  return results;
};
