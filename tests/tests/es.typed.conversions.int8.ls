{module, test} = QUnit
module \ES
DESCRIPTORS and test 'Int8 conversions' (assert)!->
  NAME  = \Int8
  ARRAY = NAME + \Array
  Typed = global[ARRAY]
  SET   = \set + NAME
  GET   = \get + NAME
  data = [
    [0,0,[0]]
    [-0,0,[0]]
    [1,1,[1]]
    [-1,-1,[255]]
    [1.1,1,[1]]
    [-1.1,-1,[255]]
    [1.9,1,[1]]
    [-1.9,-1,[255]]
    [127,127,[127]]
    [-127,-127,[129]]
    [128,-128,[128]]
    [-128,-128,[128]]
    [255,-1,[255]]
    [-255,1,[1]]
    [255.1,-1,[255]]
    [255.9,-1,[255]]
    [256,0,[0]]
    [32767,-1,[255]]
    [-32767,1,[1]]
    [32768,0,[0]]
    [-32768,0,[0]]
    [65535,-1,[255]]
    [65536,0,[0]]
    [65537,1,[1]]
    [65536.54321,0,[0]]
    [-65536.54321,0,[0]]
    [2147483647,-1,[255]]
    [-2147483647,1,[1]]
    [2147483648,0,[0]]
    [-2147483648,0,[0]]
    [4294967296,0,[0]]
    [9007199254740992,0,[0]]
    [-9007199254740992,0,[0]]
    [Infinity,0,[0]]
    [-Infinity,0,[0]]
    [-1.7976931348623157e+308,0,[0]]
    [1.7976931348623157e+308,0,[0]]
    [5e-324,0,[0]]
    [-5e-324,0,[0]]
    [NaN,0,[0]]
  ]

  # Android 4.3- bug
  if NATIVE or !/Android [2-4]/.test navigator?userAgent
    data = data.concat [
      [2147483649,1,[1]]
      [-2147483649,-1,[255]]
      [4294967295,-1,[255]]
      [4294967297,1,[1]]
      [9007199254740991,-1,[255]]
      [-9007199254740991,1,[1]]
      [9007199254740994,2,[2]]
      [-9007199254740994,-2,[254]]
    ]

  typed = new Typed 1
  uint8 = new Uint8Array typed.buffer
  view  = new DataView typed.buffer

  viewFrom = -> new DataView new Uint8Array(it).buffer
  z = -> if it is 0 and 1 / it is -Infinity => '-0' else it
  
  for [value, conversion, little] in data
    typed[0] = value
    assert.same typed[0], conversion, "#ARRAY #{z value} -> #{z conversion}"
    assert.arrayEqual uint8, little, "#ARRAY #{z value} -> [#little]"

    view[SET] 0, value
    assert.arrayEqual uint8, little, "view.#SET(0, #{z value}) -> [#little]"
    assert.same viewFrom(little)[GET](0), conversion, "view{#little}.#GET(0) -> #{z conversion}"