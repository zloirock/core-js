global = Function('return this')!
DataView = core?DataView || global.DataView
global.bufferToArray = ->
  view = new DataView it
  for i til view.byteLength => view.getUint8 i