{module, test} = QUnit
module \ES6

test \DataView, !(assert)~>
  assert.isFunction DataView
  NATIVE and assert.arity DataView, 3 # 1 in IE11
  assert.name DataView, \DataView
  assert.looksNative DataView

  d = new DataView new ArrayBuffer 8

  d.setUint32 0, 0x12345678
  assert.same d.getUint32(0), 0x12345678, 'big endian/big endian'

  d.setUint32 0, 0x12345678, true
  assert.same d.getUint32(0, true), 0x12345678, 'little endian/little endian'

  d.setUint32 0, 0x12345678, true
  assert.same d.getUint32(0), 0x78563412, 'little endian/big endian'

  d.setUint32 0, 0x12345678
  assert.same d.getUint32(0, true), 0x78563412, 'big endian/little endian'

  # Chrome allows no arguments, throws if non-ArrayBuffer
  #assert.same(new DataView().buffer.byteLength, 0, 'no arguments');

  # Safari (iOS 5) does not
  #assert.throws(function () { return new DataView(); }, TypeError, 'no arguments');

  # Chrome throws TypeError, Safari iOS5 throws isDOMException(INDEX_SIZE_ERR)
  assert.throws (-> new DataView {}), 'non-ArrayBuffer argument'
  assert.throws (-> new DataView \bogus), TypeError, 'non-ArrayBuffer argument'

test 'DataView accessors', !(assert)~>
  u = new Uint8Array 8
  d = new DataView u.buffer

  assert.arrayEqual u, [0, 0, 0, 0, 0, 0, 0, 0]

  d.setUint8 0, 255
  assert.arrayEqual u, [0xff, 0, 0, 0, 0, 0, 0, 0]

  d.setInt8 1, -1
  assert.arrayEqual u, [0xff, 0xff, 0, 0, 0, 0, 0, 0]

  d.setUint16 2, 0x1234
  assert.arrayEqual u, [0xff, 0xff, 0x12, 0x34, 0, 0, 0, 0]

  d.setInt16 4, -1
  assert.arrayEqual u, [0xff, 0xff, 0x12, 0x34, 0xff, 0xff, 0, 0]

  d.setUint32 1, 0x12345678
  assert.arrayEqual u, [0xff, 0x12, 0x34, 0x56, 0x78, 0xff, 0, 0]

  d.setInt32 4, -2023406815
  assert.arrayEqual u, [0xff, 0x12, 0x34, 0x56, 0x87, 0x65, 0x43, 0x21]

  d.setFloat32 2, 1.2e+38
  assert.arrayEqual u, [0xff, 0x12, 0x7e, 0xb4, 0x8e, 0x52, 0x43, 0x21]

  d.setFloat64 0, -1.2345678e+301
  assert.arrayEqual u, [0xfe, 0x72, 0x6f, 0x51, 0x5f, 0x61, 0x77, 0xe5]

  u.set [0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87]

  assert.same d.getUint8(0), 128
  assert.same d.getInt8(1), -127
  assert.same d.getUint16(2), 33411
  assert.same d.getInt16(3), -31868
  assert.same d.getUint32(4), 2223343239
  assert.same d.getInt32(2), -2105310075
  assert.same d.getFloat32(2), -1.932478247535851e-37
  assert.same d.getFloat64(0), -3.116851295377095e-306

test 'DataView endian', !(assert)~>
  rawbuf = new Uint8Array([0 1 2 3 4 5 6 7]).buffer
  d = new DataView rawbuf

  assert.same d.byteLength, 8, \buffer
  assert.same d.byteOffset, 0, \buffer
  assert.throws -> d.getUint8 -2  # Chrome bug for index -, DOMException, 'bounds for buffer'?
  assert.throws (-> d.getUint8 8), 'bounds for buffer'
  assert.throws (-> d.setUint8 -2, 0), 'bounds for buffer'
  assert.throws (-> d.setUint8 8, 0), 'bounds for buffer'

  d = new DataView rawbuf, 2
  assert.same d.byteLength, 6, 'buffer, byteOffset'
  assert.same d.byteOffset, 2, 'buffer, byteOffset'
  assert.same d.getUint8(5), 7, 'buffer, byteOffset'
  assert.throws (-> d.getUint8 -2), 'bounds for buffer, byteOffset'
  assert.throws (-> d.getUint8 6), 'bounds for buffer, byteOffset'
  assert.throws (-> d.setUint8 -2, 0), 'bounds for buffer, byteOffset'
  assert.throws (-> d.setUint8 6, 0), 'bounds for buffer, byteOffset'

  d = new DataView rawbuf, 8
  assert.same d.byteLength, 0, 'buffer, byteOffset'

  assert.throws (-> new DataView rawbuf, -1), 'invalid byteOffset'
  assert.throws (-> new DataView rawbuf, 9), 'invalid byteOffset'

  d = new DataView rawbuf, 2, 4
  assert.same d.byteLength, 4, 'buffer, byteOffset, length'
  assert.same d.byteOffset, 2, 'buffer, byteOffset, length'
  assert.same d.getUint8(3), 5, 'buffer, byteOffset, length'
  assert.throws (-> d.getUint8 -2), 'bounds for buffer, byteOffset, length'
  assert.throws (-> d.getUint8 4), 'bounds for buffer, byteOffset, length'
  assert.throws (-> d.setUint8 -2, 0), 'bounds for buffer, byteOffset, length'
  assert.throws (-> d.setUint8 4, 0), 'bounds for buffer, byteOffset, length'

  assert.throws (-> new DataView rawbuf, 0, 9), 'invalid byteOffset+length'
  assert.throws (-> new DataView rawbuf, 8, 1), 'invalid byteOffset+length'
  assert.throws (-> new DataView rawbuf, 9, -1), 'invalid byteOffset+length'