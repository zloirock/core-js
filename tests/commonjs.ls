{ok} = require \assert
for P in <[.. ../library]>
  ok require("#P/fn/object/assign")({q: 1}, {w: 2}).w is 2
  ok require("#P/fn/object/create")(Array.prototype) instanceof Array
  ok require("#P/fn/object/define-property")({}, \a, value: 42).a is 42
  ok require("#P/fn/object/define-properties")({}, {a: value: 42}).a is 42
  ok require("#P/fn/object/freeze") {}
  ok require("#P/fn/object/get-own-property-descriptor")({q: 1}, \q).enumerable
  ok require("#P/fn/object/get-own-property-names")(q : 42).0 is \q
  ok require("#P/fn/object/get-own-property-symbols")((Symbol!) : 42).length is 1
  ok require("#P/fn/object/get-prototype-of")([]) is Array::
  ok require("#P/fn/object/is") NaN, NaN
  ok require("#P/fn/object/is-extensible") {}
  ok !require("#P/fn/object/is-frozen") {}
  ok !require("#P/fn/object/is-sealed") {}
  ok require("#P/fn/object/keys")(q: 0).0 is \q
  ok require("#P/fn/object/prevent-extensions") {}
  ok require("#P/fn/object/seal") {}
  ok require("#P/fn/object/set-prototype-of")({}, []) instanceof Array
  ok require("#P/fn/object/entries")(q: 2).0.0 is \q
  ok require("#P/fn/object/values")(q: 2).0 is 2
  ok require("#P/fn/object/get-own-property-descriptors")(q: 1).q.enumerable
  ok typeof require("#P/fn/object/define-getter") if \function
  ok typeof require("#P/fn/object/define-setter") if \function
  ok typeof require("#P/fn/object/lookup-getter") if \function
  ok typeof require("#P/fn/object/lookup-setter") if \function
  ok require("#P/fn/object/is-object") {}
  ok require("#P/fn/object/classof")(null) is \Null
  ok \isObject of require("#P/fn/object")
  ok require("#P/fn/function/bind")(((a, b)-> @ + a + b), 1 2)(3) is 6
  ok require("#P/fn/function/part")(((a, b, c)-> a + b + c), 2 3)(4) is 9
  ok require("#P/fn/function/virtual/bind").call(((a, b)-> @ + a + b), 1 2)(3) is 6
  ok require("#P/fn/function/virtual/part").call(((a, b, c)-> a + b + c), 2 3)(4) is 9
  ok require("#P/fn/function/virtual").part.call(((a, b, c)-> a + b + c), 2 3)(4) is 9
  require("#P/fn/function/name")
  require("#P/fn/function/has-instance")
  ok Function[require("#P/fn/symbol/has-instance")] ->
  ok \part of require("#P/fn/function")
  ok require("#P/fn/array/is-array") []
  ok Array.isArray require("#P/fn/array/from") 'qwe'
  ok Array.isArray require("#P/fn/array/of") \q \w \e
  ok require("#P/fn/array/join")(\qwe 1) is \q1w1e
  ok require("#P/fn/array/slice")(\qwe 1).1 is \e
  ok require("#P/fn/array/sort")([1 3 2]).1 is 2
  ok typeof require("#P/fn/array/for-each") is \function
  ok typeof require("#P/fn/array/map") is \function
  ok typeof require("#P/fn/array/filter") is \function
  ok typeof require("#P/fn/array/some") is \function
  ok typeof require("#P/fn/array/every") is \function
  ok typeof require("#P/fn/array/reduce") is \function
  ok typeof require("#P/fn/array/reduce-right") is \function
  ok typeof require("#P/fn/array/index-of") is \function
  ok typeof require("#P/fn/array/last-index-of") is \function
  ok require("#P/fn/array/copy-within")([1 2 3 4 5] 0 3).0 is 4
  ok \next of require("#P/fn/array/entries")([])
  ok require("#P/fn/array/fill")(Array(5), 2).0 is 2
  ok require("#P/fn/array/find")([2 3 4], -> it % 2) is 3
  ok require("#P/fn/array/find-index")([2 3 4], -> it % 2) is 1
  ok \next of require("#P/fn/array/keys")([])
  ok \next of require("#P/fn/array/values")([])
  ok require("#P/fn/array/includes")([1 2 3], 2)
  ok \next of require("#P/fn/array/iterator") []
  ok require("#P/fn/array/virtual/join").call(\qwe 1) is \q1w1e
  ok require("#P/fn/array/virtual/slice").call(\qwe 1).1 is \e
  ok require("#P/fn/array/virtual/sort").call([1 3 2]).1 is 2
  ok typeof require("#P/fn/array/virtual/for-each") is \function
  ok typeof require("#P/fn/array/virtual/map") is \function
  ok typeof require("#P/fn/array/virtual/filter") is \function
  ok typeof require("#P/fn/array/virtual/some") is \function
  ok typeof require("#P/fn/array/virtual/every") is \function
  ok typeof require("#P/fn/array/virtual/reduce") is \function
  ok typeof require("#P/fn/array/virtual/reduce-right") is \function
  ok typeof require("#P/fn/array/virtual/index-of") is \function
  ok typeof require("#P/fn/array/virtual/last-index-of") is \function
  ok require("#P/fn/array/virtual/copy-within").call([1 2 3 4 5] 0 3).0 is 4
  ok \next of require("#P/fn/array/virtual/entries").call([])
  ok require("#P/fn/array/virtual/fill").call(Array(5), 2).0 is 2
  ok require("#P/fn/array/virtual/find").call([2 3 4], -> it % 2) is 3
  ok require("#P/fn/array/virtual/find-index").call([2 3 4], -> it % 2) is 1
  ok \next of require("#P/fn/array/virtual/keys").call([])
  ok \next of require("#P/fn/array/virtual/values").call([])
  ok require("#P/fn/array/virtual/includes").call([1 2 3], 2)
  ok \next of require("#P/fn/array/virtual/iterator").call []
  ok require("#P/fn/array/virtual").includes.call([1 2 3], 2)
  ok \keys of require("#P/fn/array")
  # legacy
  ok require("#P/fn/array/concat")([1 2 3], [4 5 6]).length is 6
  ok require("#P/fn/array/pop")([1 2 3]) is 3
  ok require("#P/fn/array/push")([1 2 3], 4) is 4
  ok require("#P/fn/array/reverse")([1 2 3]).0 is 3
  ok require("#P/fn/array/shift")([1 2 3]) is 1
  ok require("#P/fn/array/splice")([1 2 3], 1 2).0 is 2
  ok require("#P/fn/array/unshift")([1 2 3], 0) is 4
  # ...
  ok require("#P/fn/math/acosh")(1) is 0
  ok require("#P/fn/math/asinh")(-0) is -0
  ok require("#P/fn/math/atanh")(1) is Infinity
  ok require("#P/fn/math/cbrt")(-8) is -2
  ok require("#P/fn/math/clz32")(0) is 32
  ok require("#P/fn/math/cosh")(0) is 1
  ok require("#P/fn/math/expm1")(-Infinity) is -1
  ok require("#P/fn/math/fround")(0) is 0
  ok require("#P/fn/math/hypot")(3, 4) is 5
  ok require("#P/fn/math/imul")(2, 2) is 4
  ok require("#P/fn/math/log10")(-0) is -Infinity
  ok require("#P/fn/math/log1p")(-1) is -Infinity
  ok require("#P/fn/math/log2")(1) is 0
  ok require("#P/fn/math/sign")(-2) is -1
  ok require("#P/fn/math/sinh")(-0) is -0
  ok require("#P/fn/math/tanh")(Infinity) is 1
  ok require("#P/fn/math/trunc")(1.5) is 1
  ok require("#P/fn/math/clamp")(6 2 4) is 4
  ok require("#P/fn/math/deg-per-rad") is Math.PI / 180
  ok require("#P/fn/math/degrees")(Math.PI) is 180
  ok require("#P/fn/math/fscale")(3 1 2 1 2) is 3
  ok require("#P/fn/math/iaddh")(3 2 0xffffffff 4) is 7
  ok require("#P/fn/math/isubh")(3 4 0xffffffff 2) is 1
  ok require("#P/fn/math/imulh")(0xffffffff 7) is -1
  ok require("#P/fn/math/rad-per-deg") is 180 / Math.PI
  ok require("#P/fn/math/radians")(180) is Math.PI
  ok require("#P/fn/math/scale")(3 1 2 1 2) is 3
  ok require("#P/fn/math/umulh")(0xffffffff 7) is 6
  ok require("#P/fn/math/signbit")(-2) is no
  ok require("#P/fn/number/constructor")(\5) is 5
  ok require("#P/fn/number/epsilon") is Math.pow 2 -52
  ok require("#P/fn/number/is-finite") 42.5
  ok require("#P/fn/number/is-integer")(42.5) is no
  ok require("#P/fn/number/is-nan") NaN
  ok require("#P/fn/number/is-safe-integer") 42
  ok require("#P/fn/number/max-safe-integer") is 0x1fffffffffffff
  ok require("#P/fn/number/min-safe-integer") is -0x1fffffffffffff
  ok require("#P/fn/number/parse-float")('1.5') is 1.5
  ok require("#P/fn/number/parse-int")('2.1') is 2
  ok require("#P/fn/number/to-fixed")(1 1) is '1.0'
  ok require("#P/fn/number/to-precision")(1) is \1
  ok require("#P/fn/parse-float")('1.5') is 1.5
  ok require("#P/fn/parse-int")('2.1') is 2
  ok require("#P/fn/number/virtual/to-fixed").call(1 1) is '1.0'
  ok require("#P/fn/number/virtual/to-precision").call(1) is \1
  ok require("#P/fn/number/virtual").toFixed.call(42, 2) is '42.00'
  ok \isNaN of require("#P/fn/number")
  ok require("#P/fn/reflect/apply")(((a, b)-> a + b), null, [1, 2]) is 3
  ok require("#P/fn/reflect/construct")((-> @a = 2), []).a is 2
  require("#P/fn/reflect/define-property")(O = {}, \a {value: 42})
  ok O.a is 42
  ok require("#P/fn/reflect/delete-property") {q: 1}, \q
  ok require("#P/fn/reflect/get")({q: 1}, \q) is 1
  ok require("#P/fn/reflect/get-own-property-descriptor")({q: 1}, \q).enumerable
  ok require("#P/fn/reflect/get-prototype-of")([]) is Array::
  ok require("#P/fn/reflect/has")({q: 1}, \q)
  ok require("#P/fn/reflect/is-extensible") {}
  ok require("#P/fn/reflect/own-keys")(q: 1).0 is \q
  ok require("#P/fn/reflect/prevent-extensions") {}
  ok require("#P/fn/reflect/set")({}, \a 42)
  require("#P/fn/reflect/set-prototype-of")(O = {}, [])
  ok O instanceof Array
  ok typeof require("#P/fn/reflect/define-metadata") is \function
  ok typeof require("#P/fn/reflect/delete-metadata") is \function
  ok typeof require("#P/fn/reflect/get-metadata") is \function
  ok typeof require("#P/fn/reflect/get-metadata-keys") is \function
  ok typeof require("#P/fn/reflect/get-own-metadata") is \function
  ok typeof require("#P/fn/reflect/get-own-metadata-keys") is \function
  ok typeof require("#P/fn/reflect/has-metadata") is \function
  ok typeof require("#P/fn/reflect/has-own-metadata") is \function
  ok typeof require("#P/fn/reflect/metadata") is \function
  ok \has of require("#P/fn/reflect")
  ok require("#P/fn/string/from-code-point")(97) is \a
  ok require("#P/fn/string/raw")({raw: \test}, 0, 1, 2) is \t0e1s2t
  ok require("#P/fn/string/code-point-at")(\a 0) is 97
  ok require("#P/fn/string/ends-with") \qwe, \we
  ok require("#P/fn/string/includes") \qwe, \w
  ok require("#P/fn/string/repeat")(\q 3) is \qqq
  ok require("#P/fn/string/starts-with") \qwe, \qw
  ok typeof require("#P/fn/string/anchor") is \function
  ok typeof require("#P/fn/string/big") is \function
  ok typeof require("#P/fn/string/blink") is \function
  ok typeof require("#P/fn/string/bold") is \function
  ok typeof require("#P/fn/string/fixed") is \function
  ok typeof require("#P/fn/string/fontcolor") is \function
  ok typeof require("#P/fn/string/fontsize") is \function
  ok typeof require("#P/fn/string/italics") is \function
  ok typeof require("#P/fn/string/link") is \function
  ok typeof require("#P/fn/string/small") is \function
  ok typeof require("#P/fn/string/strike") is \function
  ok typeof require("#P/fn/string/sub") is \function
  ok typeof require("#P/fn/string/sup") is \function
  ok require("#P/fn/string/at")(\a 0) is \a
  ok require("#P/fn/string/pad-start")(\a 3) is '  a'
  ok require("#P/fn/string/pad-end")(\a 3) is 'a  '
  ok require("#P/fn/string/trim-start")(' a ') is 'a '
  ok require("#P/fn/string/trim-end")(' a ') is ' a'
  ok require("#P/fn/string/trim-left")(' a ') is 'a '
  ok require("#P/fn/string/trim-right")(' a ') is ' a'
  ok \next of require("#P/fn/string/match-all")(\a /./)
  ok \next of require("#P/fn/string/iterator") \qwe
  ok require("#P/fn/string/virtual/code-point-at").call(\a 0) is 97
  ok require("#P/fn/string/virtual/ends-with").call \qwe, \we
  ok require("#P/fn/string/virtual/includes").call \qwe, \w
  ok require("#P/fn/string/virtual/repeat").call(\q 3) is \qqq
  ok require("#P/fn/string/virtual/starts-with").call \qwe, \qw
  ok typeof require("#P/fn/string/virtual/anchor") is \function
  ok typeof require("#P/fn/string/virtual/big") is \function
  ok typeof require("#P/fn/string/virtual/blink") is \function
  ok typeof require("#P/fn/string/virtual/bold") is \function
  ok typeof require("#P/fn/string/virtual/fixed") is \function
  ok typeof require("#P/fn/string/virtual/fontcolor") is \function
  ok typeof require("#P/fn/string/virtual/fontsize") is \function
  ok typeof require("#P/fn/string/virtual/italics") is \function
  ok typeof require("#P/fn/string/virtual/link") is \function
  ok typeof require("#P/fn/string/virtual/small") is \function
  ok typeof require("#P/fn/string/virtual/strike") is \function
  ok typeof require("#P/fn/string/virtual/sub") is \function
  ok typeof require("#P/fn/string/virtual/sup") is \function
  ok require("#P/fn/string/virtual/at").call(\a 0) is \a
  ok require("#P/fn/string/virtual/pad-start").call(\a 3) is '  a'
  ok require("#P/fn/string/virtual/pad-end").call(\a 3) is 'a  '
  ok require("#P/fn/string/virtual/trim-start").call(' a ') is 'a '
  ok require("#P/fn/string/virtual/trim-end").call(' a ') is ' a'
  ok require("#P/fn/string/virtual/trim-left").call(' a ') is 'a '
  ok require("#P/fn/string/virtual/trim-right").call(' a ') is ' a'
  ok \next of require("#P/fn/string/virtual/match-all").call(\a /./)
  ok require("#P/fn/string/virtual").at.call('a', 0) is 'a'
  ok \next of require("#P/fn/string/virtual/iterator").call \qwe
  ok \raw of require("#P/fn/string")
  ok require("#P/fn/regexp/constructor")(\a \g) + '' is '/a/g'
  ok require("#P/fn/regexp/to-string")(/./g) is '/./g'
  ok require("#P/fn/regexp/flags")(/./g) is \g
  ok typeof require("#P/fn/regexp/match") is \function
  ok typeof require("#P/fn/regexp/replace") is \function
  ok typeof require("#P/fn/regexp/search") is \function
  ok typeof require("#P/fn/regexp/split") is \function
  require("#P/fn/regexp")
  ok require("#P/fn/json").stringify([1]) is '[1]'
  ok require("#P/fn/json/stringify")([1]) is '[1]'
  ok typeof require("#P/fn/date/now")(new Date) is \number
  ok typeof require("#P/fn/date/to-string")(new Date) is \string
  ok typeof require("#P/fn/date/to-primitive")(new Date, \number) is \number
  ok typeof require("#P/fn/date/to-iso-string")(new Date) is \string
  ok require("#P/fn/date/to-json")(Infinity) is null
  ok require("#P/fn/date")
  ok require("#P/fn/symbol/has-instance")
  ok require("#P/fn/symbol/is-concat-spreadable")
  ok require("#P/fn/symbol/iterator")
  ok require("#P/fn/symbol/match")
  ok require("#P/fn/symbol/replace")
  ok require("#P/fn/symbol/search")
  ok require("#P/fn/symbol/species")
  ok require("#P/fn/symbol/split")
  ok require("#P/fn/symbol/to-primitive")
  ok require("#P/fn/symbol/to-string-tag")
  ok require("#P/fn/symbol/unscopables")
  ok require("#P/fn/symbol/async-iterator")
  ok require("#P/fn/symbol/observable")
  ok typeof require("#P/fn/symbol/for") is \function
  ok typeof require("#P/fn/symbol/key-for") is \function
  ok \iterator of require("#P/fn/symbol")
  ok new (require("#P/fn/map"))([[1, 2], [3, 4]]).size is 2
  ok new (require("#P/fn/set"))([1, 2, 3, 2, 1]).size is 3
  ok new (require("#P/fn/weak-map"))([[O = {}, 42]]).get(O) is 42
  ok new (require("#P/fn/weak-set"))([O = {}]).has O
  ok require("#P/fn/map/of")([1 2], [3 4]) instanceof require("#P/fn/map")
  ok require("#P/fn/set/of")(1 2 3 2 1) instanceof require("#P/fn/set")
  ok require("#P/fn/weak-map/of")([{}, 1], [[], 2]) instanceof require("#P/fn/weak-map")
  ok require("#P/fn/weak-set/of")({}, []) instanceof require("#P/fn/weak-set")
  ok require("#P/fn/map/from")([[1 2], [3 4]]) instanceof require("#P/fn/map")
  ok require("#P/fn/set/from")([1 2 3 2 1]) instanceof require("#P/fn/set")
  ok require("#P/fn/weak-map/from")([[{}, 1], [[], 2]]) instanceof require("#P/fn/weak-map")
  ok require("#P/fn/weak-set/from")([{}, []]) instanceof require("#P/fn/weak-set")
  ok typeof require("#P/fn/typed/array-buffer") is \function
  ok typeof require("#P/fn/typed/data-view") is \function
  ok typeof require("#P/fn/typed/int8-array") is \function
  ok typeof require("#P/fn/typed/uint8-array") is \function
  ok typeof require("#P/fn/typed/uint8-clamped-array") is \function
  ok typeof require("#P/fn/typed/int16-array") is \function
  ok typeof require("#P/fn/typed/uint16-array") is \function
  ok typeof require("#P/fn/typed/int32-array") is \function
  ok typeof require("#P/fn/typed/uint32-array") is \function
  ok typeof require("#P/fn/typed/float32-array") is \function
  ok typeof require("#P/fn/typed/float64-array") is \function
  ok typeof require("#P/fn/typed").Uint32Array is \function
  ok \all of require("#P/fn/promise")
  ok require("#P/fn/promise/try")(-> 42) instanceof require("#P/fn/promise")
  ok \from of require("#P/fn/observable")
  ok require("#P/fn/global").Math is Math
  ok typeof require("#P/fn/dom-collections").iterator is \function
  ok typeof require("#P/fn/dom-collections/iterator") is \function
  ok typeof require("#P/fn/set-timeout") is \function
  ok typeof require("#P/fn/set-interval") is \function
  ok typeof require("#P/fn/set-immediate") is \function
  ok typeof require("#P/fn/clear-immediate") is \function
  ok typeof require("#P/fn/asap") is \function
  ok \mapPairs of require("#P/fn/dict")
  ok require("#P/fn/is-iterable")([])
  ok typeof require("#P/fn/get-iterator-method")([]) is \function
  ok \next of require("#P/fn/get-iterator")([])
  ################################################
  ok \Array of require("#P/es5")
  ok \map of require("#P/es6/array")
  require("#P/es6/function")
  ok typeof require("#P/es6/map") is \function
  ok typeof require("#P/es6/set") is \function
  ok typeof require("#P/es6/weak-map") is \function
  ok typeof require("#P/es6/weak-set") is \function
  ok \hypot of require("#P/es6/math")
  ok \MAX_SAFE_INTEGER of require("#P/es6/number")
  ok require("#P/es6/parse-float")('1.5') is 1.5
  ok require("#P/es6/parse-int")('2.1') is 2
  ok \assign of require("#P/es6/object")
  ok typeof require("#P/es6/promise") is \function
  ok \ownKeys of require("#P/es6/reflect")
  require("#P/es6/regexp")
  ok \raw of require("#P/es6/string")
  ok require("#P/es6/date")
  ok typeof require("#P/es6/symbol") is \function
  ok typeof require("#P/es6/typed").Uint32Array is \function
  ok \Map of require("#P/es6")
  ok \includes of require("#P/es7/array")
  ok \values of require("#P/es7/object")
  ok \at of require("#P/es7/string")
  require("#P/es7/set")
  require("#P/es7/map")
  require("#P/es7/weak-set")
  require("#P/es7/weak-map")
  ok require("#P/es7/global").Math is Math
  ok typeof require("#P/es7/math").isubh is \function
  ok typeof require("#P/es7/promise").try is \function
  ok \metadata of require("#P/es7/reflect")
  ok typeof require("#P/es7/asap") is \function
  ok \observable of require("#P/es7/symbol")
  ok \from of require("#P/es7/observable")
  ok \Array of require("#P/es7")
  ok \setTimeout of require("#P/web/timers")
  ok \setImmediate of require("#P/web/immediate")
  require("#P/web/dom-collections")
  ok \setImmediate of require("#P/web")
  ok require("#P/core/_")
  ok typeof require("#P/core/dict") is \function
  ok \part of require("#P/core/function")
  ok \isObject of require("#P/core/object")
  ok \Array of require("#P/core")
  ok require("#P/stage/4")
  ok require("#P/stage/3")
  ok require("#P/stage/2")
  ok require("#P/stage/1")
  ok require("#P/stage/0")
  ok require("#P/stage/pre")
  ok require("#P/stage")
console.log 'CommonJS - OK'
