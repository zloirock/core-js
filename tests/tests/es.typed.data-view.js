import { DESCRIPTORS, NATIVE } from '../helpers/constants';

QUnit.test('DataView', function (assert) {
  assert.same(DataView, Object(DataView), 'is object'); // in Safari 5 typeof DataView is 'object'
  if (NATIVE) assert.arity(DataView, 3); // 1 in IE11
  if (NATIVE) assert.name(DataView, 'DataView'); // Safari 5 bug
  if (NATIVE) assert.looksNative(DataView); // Safari 5 bug
  var dataview = new DataView(new ArrayBuffer(8));
  assert.same(dataview.byteOffset, 0, '#byteOffset, passed buffer');
  assert.same(dataview.byteLength, 8, '#byteLength, passed buffer');
  dataview = new DataView(new ArrayBuffer(16), 8);
  assert.same(dataview.byteOffset, 8, '#byteOffset, passed buffer and byteOffset');
  assert.same(dataview.byteLength, 8, '#byteLength, passed buffer and byteOffset');
  dataview = new DataView(new ArrayBuffer(24), 8, 8);
  assert.same(dataview.byteOffset, 8, '#byteOffset, passed buffer, byteOffset and length');
  assert.same(dataview.byteLength, 8, '#byteLength, passed buffer, byteOffset and length');
  if (NATIVE) {
    // fails in IE / MS Edge
    dataview = new DataView(new ArrayBuffer(8), undefined);
    assert.same(dataview.byteOffset, 0, '#byteOffset, passed buffer and undefined');
    assert.same(dataview.byteLength, 8, '#byteLength, passed buffer and undefined');
    // fails in IE / MS Edge
    dataview = new DataView(new ArrayBuffer(16), 8, undefined);
    assert.same(dataview.byteOffset, 8, '#byteOffset, passed buffer, byteOffset and undefined');
    assert.same(dataview.byteLength, 8, '#byteLength, passed buffer, byteOffset and undefined');
    // fails in IE10
    dataview = new DataView(new ArrayBuffer(8), 8);
    assert.same(dataview.byteOffset, 8, '#byteOffset, passed buffer and byteOffset with buffer length');
    assert.same(dataview.byteLength, 0, '#byteLength, passed buffer and byteOffset with buffer length');
    // TypeError in IE + FF bug - TypeError instead of RangeError
    assert.throws(function () {
      new DataView(new ArrayBuffer(8), -1);
    }, RangeError, 'If offset < 0, throw a RangeError exception');
    assert.throws(function () {
      new DataView(new ArrayBuffer(8), 16);
    }, RangeError, 'If newByteLength < 0, throw a RangeError exception');
    assert.throws(function () {
      new DataView(new ArrayBuffer(24), 8, 24);
    }, RangeError, 'If offset+newByteLength > bufferByteLength, throw a RangeError exception');
    // Android ~ 4.0
    assert.throws(function () {
      DataView(1);
    }, TypeError, 'throws without `new`');
    assert.throws(function () {
      DataView(1);
    }, 'throws without `new`');
  } else {
    // FF bug - TypeError instead of RangeError
    assert.throws(function () {
      new DataView(new ArrayBuffer(8), -1);
    }, 'If offset < 0, throw a RangeError exception');
    assert.throws(function () {
      new DataView(new ArrayBuffer(8), 16);
    }, 'If newByteLength < 0, throw a RangeError exception');
    assert.throws(function () {
      new DataView(new ArrayBuffer(24), 8, 24);
    }, 'If offset+newByteLength > bufferByteLength, throw a RangeError exception');
  }
  dataview = new DataView(new ArrayBuffer(8));
  dataview.setUint32(0, 0x12345678);
  assert.same(dataview.getUint32(0), 0x12345678, 'big endian/big endian');
  dataview.setUint32(0, 0x12345678, true);
  assert.same(dataview.getUint32(0, true), 0x12345678, 'little endian/little endian');
  dataview.setUint32(0, 0x12345678, true);
  assert.same(dataview.getUint32(0), 0x78563412, 'little endian/big endian');
  dataview.setUint32(0, 0x12345678);
  assert.same(dataview.getUint32(0, true), 0x78563412, 'big endian/little endian');
  assert.throws(function () {
    new DataView({});
  }, 'non-ArrayBuffer argument');
  assert.ok(function () {
    try {
      new DataView('foo');
    } catch (e) {
      return e;
    }
  }, 'non-ArrayBuffer argument');
});

if (DESCRIPTORS) {
  QUnit.test('DataView accessors', function (assert) {
    var uint8array = new Uint8Array(8);
    var dataview = new DataView(uint8array.buffer);
    assert.arrayEqual(uint8array, [0, 0, 0, 0, 0, 0, 0, 0]);
    dataview.setUint8(0, 255);
    assert.arrayEqual(uint8array, [0xff, 0, 0, 0, 0, 0, 0, 0]);
    dataview.setInt8(1, -1);
    assert.arrayEqual(uint8array, [0xff, 0xff, 0, 0, 0, 0, 0, 0]);
    dataview.setUint16(2, 0x1234);
    assert.arrayEqual(uint8array, [0xff, 0xff, 0x12, 0x34, 0, 0, 0, 0]);
    dataview.setInt16(4, -1);
    assert.arrayEqual(uint8array, [0xff, 0xff, 0x12, 0x34, 0xff, 0xff, 0, 0]);
    dataview.setUint32(1, 0x12345678);
    assert.arrayEqual(uint8array, [0xff, 0x12, 0x34, 0x56, 0x78, 0xff, 0, 0]);
    dataview.setInt32(4, -2023406815);
    assert.arrayEqual(uint8array, [0xff, 0x12, 0x34, 0x56, 0x87, 0x65, 0x43, 0x21]);
    dataview.setFloat32(2, 1.2e+38);
    assert.arrayEqual(uint8array, [0xff, 0x12, 0x7e, 0xb4, 0x8e, 0x52, 0x43, 0x21]);
    dataview.setFloat64(0, -1.2345678e+301);
    assert.arrayEqual(uint8array, [0xfe, 0x72, 0x6f, 0x51, 0x5f, 0x61, 0x77, 0xe5]);
    var data = [0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87];
    for (var i = 0, length = data.length; i < length; ++i) {
      uint8array[i] = data[i];
    }
    assert.same(dataview.getUint8(0), 128);
    assert.same(dataview.getInt8(1), -127);
    assert.same(dataview.getUint16(2), 33411);
    assert.same(dataview.getInt16(3), -31868);
    assert.same(dataview.getUint32(4), 2223343239);
    assert.same(dataview.getInt32(2), -2105310075);
    assert.same(dataview.getFloat32(2), -1.932478247535851e-37);
    assert.same(dataview.getFloat64(0), -3.116851295377095e-306);
  });

  QUnit.test('DataView endian', function (assert) {
    var buffer = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]).buffer;
    var dataview = new DataView(buffer);
    assert.same(dataview.byteLength, 8, 'buffer');
    assert.same(dataview.byteOffset, 0, 'buffer');
    assert.throws(function () {
      return dataview.getUint8(-2);
    });
    assert.throws(function () {
      dataview.getUint8(8);
    }, 'bounds for buffer');
    assert.throws(function () {
      dataview.setUint8(-2, 0);
    }, 'bounds for buffer');
    assert.throws(function () {
      dataview.setUint8(8, 0);
    }, 'bounds for buffer');
    dataview = new DataView(buffer, 2);
    assert.same(dataview.byteLength, 6, 'buffer, byteOffset');
    assert.same(dataview.byteOffset, 2, 'buffer, byteOffset');
    assert.same(dataview.getUint8(5), 7, 'buffer, byteOffset');
    assert.throws(function () {
      dataview.getUint8(-2);
    }, 'bounds for buffer, byteOffset');
    assert.throws(function () {
      dataview.getUint8(6);
    }, 'bounds for buffer, byteOffset');
    assert.throws(function () {
      dataview.setUint8(-2, 0);
    }, 'bounds for buffer, byteOffset');
    assert.throws(function () {
      dataview.setUint8(6, 0);
    }, 'bounds for buffer, byteOffset');
    assert.throws(function () {
      new DataView(buffer, -1);
    }, 'invalid byteOffset');
    assert.throws(function () {
      new DataView(buffer, 9);
    }, 'invalid byteOffset');
    dataview = new DataView(buffer, 2, 4);
    assert.same(dataview.byteLength, 4, 'buffer, byteOffset, length');
    assert.same(dataview.byteOffset, 2, 'buffer, byteOffset, length');
    assert.same(dataview.getUint8(3), 5, 'buffer, byteOffset, length');
    assert.throws(function () {
      dataview.getUint8(-2);
    }, 'bounds for buffer, byteOffset, length');
    assert.throws(function () {
      dataview.getUint8(4);
    }, 'bounds for buffer, byteOffset, length');
    assert.throws(function () {
      dataview.setUint8(-2, 0);
    }, 'bounds for buffer, byteOffset, length');
    assert.throws(function () {
      dataview.setUint8(4, 0);
    }, 'bounds for buffer, byteOffset, length');
    assert.throws(function () {
      new DataView(buffer, 0, 9);
    }, 'invalid byteOffset+length');
    assert.throws(function () {
      new DataView(buffer, 8, 1);
    }, 'invalid byteOffset+length');
    assert.throws(function () {
      new DataView(buffer, 9, -1);
    }, 'invalid byteOffset+length');
  });
}

var types = ['Uint8', 'Int8', 'Uint16', 'Int16', 'Uint32', 'Int32', 'Float32', 'Float64'];
for (var i = 0, length = types.length; i < length; ++i) !function (GETTER, SETTER) {
  QUnit.test('DataView#' + GETTER, function (assert) {
    assert.isFunction(DataView.prototype[GETTER]);
    NATIVE && assert.arity(DataView.prototype[GETTER], 1);
    assert.same(new DataView(new ArrayBuffer(8))[GETTER](0), 0, 'returns element');
  });

  QUnit.test('DataView#' + SETTER, function (assert) {
    assert.isFunction(DataView.prototype[SETTER]);
    NATIVE && assert.arity(DataView.prototype[SETTER], 2);
    assert.same(new DataView(new ArrayBuffer(8))[SETTER](0, 0), undefined, 'void');
  });
}('get' + types[i], 'set' + types[i]);
