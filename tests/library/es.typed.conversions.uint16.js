var test = QUnit.test;

DESCRIPTORS && test('Uint16 conversions', function (assert) {
  var Uint16Array = core.Uint16Array;
  var Uint8Array = core.Uint8Array;
  var DataView = core.DataView;

  var uint16array = new Uint16Array(1);
  var uint8array = new Uint8Array(uint16array.buffer);
  var dataview = new DataView(uint16array.buffer);

  function viewFrom(it) {
    return new DataView(new Uint8Array(it).buffer);
  }
  function toString(it) {
    return it === 0 && 1 / it === -Infinity ? '-0' : it;
  }

  var data = [
    [0, 0, [0, 0]],
    [-0, 0, [0, 0]],
    [1, 1, [1, 0]],
    [-1, 65535, [255, 255]],
    [1.1, 1, [1, 0]],
    [-1.1, 65535, [255, 255]],
    [1.9, 1, [1, 0]],
    [-1.9, 65535, [255, 255]],
    [127, 127, [127, 0]],
    [-127, 65409, [129, 255]],
    [128, 128, [128, 0]],
    [-128, 65408, [128, 255]],
    [255, 255, [255, 0]],
    [-255, 65281, [1, 255]],
    [255.1, 255, [255, 0]],
    [255.9, 255, [255, 0]],
    [256, 256, [0, 1]],
    [32767, 32767, [255, 127]],
    [-32767, 32769, [1, 128]],
    [32768, 32768, [0, 128]],
    [-32768, 32768, [0, 128]],
    [65535, 65535, [255, 255]],
    [65536, 0, [0, 0]],
    [65537, 1, [1, 0]],
    [65536.54321, 0, [0, 0]],
    [-65536.54321, 0, [0, 0]],
    [2147483647, 65535, [255, 255]],
    [-2147483647, 1, [1, 0]],
    [2147483648, 0, [0, 0]],
    [-2147483648, 0, [0, 0]],
    [4294967296, 0, [0, 0]],
    [9007199254740992, 0, [0, 0]],
    [-9007199254740992, 0, [0, 0]],
    [Infinity, 0, [0, 0]],
    [-Infinity, 0, [0, 0]],
    [-1.7976931348623157e+308, 0, [0, 0]],
    [1.7976931348623157e+308, 0, [0, 0]],
    [5e-324, 0, [0, 0]],
    [-5e-324, 0, [0, 0]],
    [NaN, 0, [0, 0]]
  ];
  // Android 4.3- bug
  if (NATIVE || !/Android [2-4]/.test(global.navigator && navigator.userAgent)) {
    data = data.concat([
      [2147483649, 1, [1, 0]],
      [-2147483649, 65535, [255, 255]],
      [4294967295, 65535, [255, 255]],
      [4294967297, 1, [1, 0]],
      [9007199254740991, 65535, [255, 255]],
      [-9007199254740991, 1, [1, 0]],
      [9007199254740994, 2, [2, 0]],
      [-9007199254740994, 65534, [254, 255]]
    ]);
  }
  for (var i = 0, length = data.length; i < length; ++i) {
    var value = data[i][0];
    var conversion = data[i][1];
    var little = data[i][2];
    var big = little.slice().reverse();
    var representation = LITTLE_ENDIAN ? little : big;
    uint16array[0] = value;
    assert.same(uint16array[0], conversion, 'Uint16Array ' + toString(value) + ' -> ' + toString(conversion));
    assert.arrayEqual(uint8array, representation, 'Uint16Array ' + toString(value) + ' -> [' + representation + ']');
    dataview.setUint16(0, value);
    assert.arrayEqual(uint8array, big, 'dataview.setUint16(0, ' + toString(value) + ') -> [' + big + ']');
    assert.same(viewFrom(big).getUint16(0), conversion, 'dataview{' + big + '}.getUint16(0) -> ' + toString(conversion));
    dataview.setUint16(0, value, false);
    assert.arrayEqual(uint8array, big, 'dataview.setUint16(0, ' + toString(value) + ', false) -> [' + big + ']');
    assert.same(viewFrom(big).getUint16(0, false), conversion, 'dataview{' + big + '}.getUint16(0, false) -> ' + toString(conversion));
    dataview.setUint16(0, value, true);
    assert.arrayEqual(uint8array, little, 'dataview.setUint16(0, ' + toString(value) + ', true) -> [' + little + ']');
    assert.same(viewFrom(little).getUint16(0, true), conversion, 'dataview{' + little + '}.getUint16(0, true) -> ' + toString(conversion));
  }
});
