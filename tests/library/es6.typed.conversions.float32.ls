{module, test} = QUnit
module \ES6
DESCRIPTORS and test 'Float32 conversions', !(assert)~>
  {Float32Array, Uint8Array, DataView} = core
  data = [
    [0 0 [0 0 0 0]]
    [-0 -0 [0 0 0 128]]
    [1 1 [0 0 128 63]]
    [-1 -1 [0 0 128 191]]
    [1.1 1.100000023841858 [205 204 140 63]]
    [-1.1 -1.100000023841858 [205 204 140 191]]
    [1.9 1.899999976158142 [51 51 243 63]]
    [-1.9 -1.899999976158142 [51 51 243 191]]
    [127 127 [0 0 254 66]]
    [-127 -127 [0 0 254 194]]
    [128 128 [0 0 0 67]]
    [-128 -128 [0 0 0 195]]
    [255 255 [0 0 127 67]]
    [-255 -255 [0 0 127 195]]
    [255.1 255.10000610351562 [154 25 127 67]]
    [255.9 255.89999389648438 [102 230 127 67]]
    [256 256 [0 0 128 67]]
    [32767 32767 [0 254 255 70]]
    [-32767 -32767 [0 254 255 198]]
    [32768 32768 [0 0 0 71]]
    [-32768 -32768 [0 0 0 199]]
    [65535 65535 [0 255 127 71]]
    [65536 65536 [0 0 128 71]]
    [65537 65537 [128 0 128 71]]
    [65536.54321 65536.546875 [70 0 128 71]]
    [-65536.54321 -65536.546875 [70 0 128 199]]
    [2147483647 2147483648 [0 0 0 79]]
    [-2147483647 -2147483648 [0 0 0 207]]
    [2147483648 2147483648 [0 0 0 79]]
    [-2147483648 -2147483648 [0 0 0 207]]
    [2147483649 2147483648 [0 0 0 79]]
    [-2147483649 -2147483648 [0 0 0 207]]
    [4294967295 4294967296 [0 0 128 79]]
    [4294967296 4294967296 [0 0 128 79]]
    [4294967297 4294967296 [0 0 128 79]]
    [Infinity, Infinity, [0 0 128 127]]
    [-Infinity, -Infinity, [0 0 128 255]]
    [1.7976931348623157e+308, Infinity, [0 0 128 127]]
    [-1.7976931348623157e+308, -Infinity, [0 0 128 255]]
    [5e-324 0 [0 0 0 0]]
    [-5e-324 -0 [0 0 0 128]]
  ]

  KEY   = \setFloat32
  typed = new Float32Array 1
  uint8 = new Uint8Array typed.buffer
  view  = new DataView typed.buffer

  z = -> if it is 0 and 1 / it is -Infinity => '-0' else it
  
  for [value, conversion, little] in data
    
    big = little.slice!reverse!
    rep = if LITTLE_ENDIAN => little else big

    typed[0] = value
    assert.same typed[0], conversion, "#{z value} -> #{z conversion}"
    assert.arrayEqual uint8, rep, "#{z value} -> #rep"

    view[KEY] 0, value
    assert.arrayEqual uint8, big, "view.#KEY(0, #{z value}) -> #big"
    view[KEY] 0, value, no
    assert.arrayEqual uint8, big, "view.#KEY(0, #{z value}, false) -> #big"
    view[KEY] 0, value, on
    assert.arrayEqual uint8, little, "view.#KEY(0, #{z value}, true) -> #little"

  typed[0] = NaN
  assert.same typed[0], NaN, "NaN -> NaN"
