{ok} = require \assert
for P in <[.. ../library]>
  ok require("#P/fn/object/assign")({q: 1}, {w: 2}).w is 2
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
  ok require("#P/fn/object/is-object") {}
  ok require("#P/fn/object/classof")(null) is \Null
  ok require("#P/fn/object/define")({}, {q: 42}).q is 42
  ok require("#P/fn/object/make")([], {}) instanceof Array
  ok \isObject of require("#P/fn/object")
  ok require("#P/fn/function/only")((-> &length), 2)(2 3 4) is 2
  ok require("#P/fn/function/part")(((a, b, c)-> a + b + c), 2 3)(4) is 9
  ok \part of require("#P/fn/function")
  ok require("#P/fn/array/copy-within")([1 2 3 4 5] 0 3).0 is 4
  ok \next of require("#P/fn/array/entries")([])
  ok require("#P/fn/array/fill")(Array(5), 2).0 is 2
  ok require("#P/fn/array/find")([2 3 4], -> it % 2) is 3
  ok require("#P/fn/array/find-index")([2 3 4], -> it % 2) is 1
  ok Array.isArray require("#P/fn/array/from") 'qwe'
  ok \next of require("#P/fn/array/keys")([])
  ok Array.isArray require("#P/fn/array/of") \q \w \e
  ok \next of require("#P/fn/array/values")([])
  ok require("#P/fn/array/includes")([1 2 3], 2)
  ok require("#P/fn/array/turn")([1, 2, 3], (-> it.q++), {q: 0}).q is 3
  ok typeof require("#P/fn/array/concat") is \function
  ok typeof require("#P/fn/array/every") is \function
  ok typeof require("#P/fn/array/filter") is \function
  ok typeof require("#P/fn/array/for-each") is \function
  ok typeof require("#P/fn/array/index-of") is \function
  ok typeof require("#P/fn/array/join") is \function
  ok typeof require("#P/fn/array/last-index-of") is \function
  ok typeof require("#P/fn/array/map") is \function
  ok typeof require("#P/fn/array/pop") is \function
  ok typeof require("#P/fn/array/push") is \function
  ok typeof require("#P/fn/array/reduce") is \function
  ok typeof require("#P/fn/array/reduce-right") is \function
  ok typeof require("#P/fn/array/reverse") is \function
  ok typeof require("#P/fn/array/shift") is \function
  ok typeof require("#P/fn/array/slice") is \function
  ok typeof require("#P/fn/array/some") is \function
  ok typeof require("#P/fn/array/sort") is \function
  ok typeof require("#P/fn/array/splice") is \function
  ok typeof require("#P/fn/array/unshift") is \function
  ok \unshift of require("#P/fn/array")
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
  ok require("#P/fn/number/epsilon") is Math.pow 2 -52
  ok require("#P/fn/number/is-finite") 42.5
  ok require("#P/fn/number/is-integer") 42
  ok require("#P/fn/number/is-nan") NaN
  ok require("#P/fn/number/is-safe-integer") 42
  ok require("#P/fn/number/max-safe-integer") is 0x1fffffffffffff
  ok require("#P/fn/number/min-safe-integer") is -0x1fffffffffffff
  ok require("#P/fn/number/parse-float")('1.5') is 1.5
  ok require("#P/fn/number/parse-int")('2.1') is 2
  ok \isNaN of require("#P/fn/number")
  ok require("#P/fn/reflect/apply")(((a, b)-> a + b), null, [1, 2]) is 3
  ok require("#P/fn/reflect/construct")(-> @a = 2).a is 2
  require("#P/fn/reflect/define-property")(O = {}, \a {value: 42})
  ok O.a is 42
  ok require("#P/fn/reflect/delete-property") {q: 1}, \q
  ok \next of require("#P/fn/reflect/enumerate") {}
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
  ok \enumerate of require("#P/fn/reflect")
  ok require("#P/fn/string/code-point-at")(\a 0) is 97
  ok require("#P/fn/string/ends-with") \qwe, \we
  ok require("#P/fn/string/from-code-point")(97) is \a
  ok require("#P/fn/string/includes") \qwe, \w
  ok require("#P/fn/string/raw")({raw: \test}, 0, 1, 2) is \t0e1s2t
  ok require("#P/fn/string/repeat")(\q 3) is \qqq
  ok require("#P/fn/string/starts-with") \qwe, \qw
  ok require("#P/fn/string/at")(\a 0) is \a
  ok require("#P/fn/string/escape-html")('<br />') is '&lt;br /&gt;'
  ok require("#P/fn/string/unescape-html")('&lt;br /&gt;') is '<br />'
  ok \raw of require("#P/fn/string")
  ok require("#P/fn/regexp/escape")('...') is '\\.\\.\\.'
  ok \escape of require("#P/fn/regexp")
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
  ok typeof require("#P/fn/symbol/for") is \function
  ok typeof require("#P/fn/symbol/key-for") is \function
  ok \iterator of require("#P/fn/symbol")
  ok typeof require("#P/fn/date/format")(new Date) is \string
  ok typeof require("#P/fn/date/format-utc")(new Date) is \string
  ok typeof require("#P/fn/date/add-locale") is \function
  ok \format of require("#P/fn/date")
  ok new (require("#P/fn/map"))([[1, 2], [3, 4]]).size is 2
  ok new (require("#P/fn/set"))([1, 2, 3, 2, 1]).size is 3
  ok new (require("#P/fn/weak-map"))([[O = {}, 42]]).get(O) is 42
  ok new (require("#P/fn/weak-set"))([O = {}]).has O
  ok \all of require("#P/fn/promise")
  ok typeof require("#P/fn/set-timeout") is \function
  ok typeof require("#P/fn/set-interval") is \function
  ok typeof require("#P/fn/set-immediate") is \function
  ok typeof require("#P/fn/clear-immediate") is \function
  ok \mapPairs of require("#P/fn/dict")
  ok \then of require("#P/fn/delay")(1)
  ok require("#P/fn/global") is global
  ok \warn of require("#P/fn/log")
  ok \of of require("#P/fn/$for")([])
  ok require("#P/fn/is-iterable")([])
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
  ok \assign of require("#P/es6/object")
  ok typeof require("#P/es6/promise") is \function
  ok \ownKeys of require("#P/es6/reflect")
  require("#P/es6/regexp")
  ok \raw of require("#P/es6/string")
  ok typeof require("#P/es6/symbol") is \function
  ok \Map of require("#P/es6")
  ok \includes of require("#P/es7/array")
  ok \values of require("#P/es7/object")
  ok \escape of require("#P/es7/regexp")
  ok \at of require("#P/es7/string")
  ok \Array of require("#P/es7")
  ok \map of require("#P/js/array")
  ok \Array of require("#P/js")
  ok \setTimeout of require("#P/web/timers")
  ok \setImmediate of require("#P/web/immediate")
  require("#P/web/dom")
  ok \setImmediate of require("#P/web")
  ok typeof require("#P/core/$for") is \function
  ok require("#P/core/_")
  ok \turn of require("#P/core/array")
  ok \format of require("#P/core/date")
  ok typeof require("#P/core/delay") is \function
  ok typeof require("#P/core/dict") is \function
  ok \part of require("#P/core/function")
  ok require("#P/core/global")
  ok typeof require("#P/core/log") is \function
  ok \random of require("#P/core/number")
  ok \define of require("#P/core/object")
  ok \escapeHTML of require("#P/core/string")
  ok \Array of require("#P/core")
console.log \OK
