global = Function('return this')!
ArrayBuffer = core?ArrayBuffer || global.ArrayBuffer
DataView    = core?DataView || global.DataView
global.arrayToBuffer = ->
  buffer = new ArrayBuffer it.length
  view = new DataView buffer
  for i til it.length => view.setUint8 i, it[i]
  buffer