{module, test} = QUnit
module \ES
DESCRIPTORS and test 'Float32 conversions' (assert)!->
  NAME  = \Float32
  ARRAY = NAME + \Array
  Typed = global[ARRAY]
  SET   = \set + NAME
  GET   = \get + NAME
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
    [9007199254740991,9007199254740992,[0,0,0,90]]
    [-9007199254740991,-9007199254740992,[0,0,0,218]]
    [9007199254740992,9007199254740992,[0,0,0,90]]
    [-9007199254740992,-9007199254740992,[0,0,0,218]]
    [9007199254740994,9007199254740992,[0,0,0,90]]
    [-9007199254740994,-9007199254740992,[0,0,0,218]]
    [Infinity, Infinity, [0 0 128 127]]
    [-Infinity, -Infinity, [0 0 128 255]]
    [1.7976931348623157e+308, Infinity, [0 0 128 127]]
    [-1.7976931348623157e+308, -Infinity, [0 0 128 255]]
    [5e-324 0 [0 0 0 0]]
    [-5e-324 -0 [0 0 0 128]]
  ]

  typed = new Typed 1
  uint8 = new Uint8Array typed.buffer
  view  = new DataView typed.buffer

  viewFrom = -> new DataView new Uint8Array(it).buffer
  z = -> if it is 0 and 1 / it is -Infinity => '-0' else it
  
  for [value, conversion, little] in data
    
    big = little.slice!reverse!
    rep = if LITTLE_ENDIAN => little else big

    typed[0] = value
    assert.same typed[0], conversion, "#ARRAY #{z value} -> #{z conversion}"
    assert.arrayEqual uint8, rep, "#ARRAY #{z value} -> [#rep]"

    view[SET] 0, value
    assert.arrayEqual uint8, big, "view.#SET(0, #{z value}) -> [#big]"
    assert.same viewFrom(big)[GET](0), conversion, "view{#big}.#GET(0) -> #{z conversion}"
    view[SET] 0, value, no
    assert.arrayEqual uint8, big, "view.#SET(0, #{z value}, false) -> [#big]"
    assert.same viewFrom(big)[GET](0, no), conversion, "view{#big}.#GET(0, false) -> #{z conversion}"
    view[SET] 0, value, on
    assert.arrayEqual uint8, little, "view.#SET(0, #{z value}, true) -> [#little]"
    assert.same viewFrom(little)[GET](0, on), conversion, "view{#little}.#GET(0, true) -> #{z conversion}"

  typed[0] = NaN
  assert.same typed[0], NaN, "NaN -> NaN"
