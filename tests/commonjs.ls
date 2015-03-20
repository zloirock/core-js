{ok} = require \assert
for P in <[.. ../library]>
  ok \Object of require "#P/es5"
  ok require("#P/es6/array/copy-within")([1 2 3 4 5] 0 3).0 is 4
  ok \next of require("#P/es6/array/entries")([])
  ok require("#P/es6/array/fill")(Array(5), 2).0 is 2
  ok require("#P/es6/array/find")([2 3 4], -> it % 2) is 3
  ok require("#P/es6/array/find-index")([2 3 4], -> it % 2) is 1
  ok Array.isArray require("#P/es6/array/from") 'qwe'
  ok \next of require("#P/es6/array/keys")([])
  ok Array.isArray require("#P/es6/array/of") \q \w \e
  ok \next of require("#P/es6/array/values")([])
  ok \next of require("#P/es6/string/iterator")([])
  ok \find of require("#P/es6/array/prototype")
  ok \from of require("#P/es6/array")
  ok require("#P/es6/math/acosh")(1) is 0
  ok require("#P/es6/math/asinh")(-0) is -0
  ok require("#P/es6/math/atanh")(1) is Infinity
  ok require("#P/es6/math/cbrt")(-8) is -2
  ok require("#P/es6/math/clz32")(0) is 32
  ok require("#P/es6/math/cosh")(0) is 1
  ok require("#P/es6/math/expm1")(-Infinity) is -1
  ok require("#P/es6/math/fround")(0) is 0
  ok require("#P/es6/math/hypot")(3, 4) is 5
  ok require("#P/es6/math/imul")(2, 2) is 4
  ok require("#P/es6/math/log10")(-0) is -Infinity
  ok require("#P/es6/math/log1p")(-1) is -Infinity
  ok require("#P/es6/math/log2")(1) is 0
  ok require("#P/es6/math/sign")(-2) is -1
  ok require("#P/es6/math/sinh")(-0) is -0
  ok require("#P/es6/math/tanh")(Infinity) is 1
  ok require("#P/es6/math/trunc")(1.5) is 1
  ok \trunc of require("#P/es6/math")
  ok require("#P/es6/number/epsilon") is Math.pow 2 -52
  ok require("#P/es6/number/is-finite") 42.5
  ok require("#P/es6/number/is-integer") 42
  ok require("#P/es6/number/is-nan") NaN
  ok require("#P/es6/number/is-safe-integer") 42
  ok require("#P/es6/number/max-safe-integer") is 0x1fffffffffffff
  ok require("#P/es6/number/min-safe-integer") is -0x1fffffffffffff
  ok require("#P/es6/number/parse-float")('1.5') is 1.5
  ok require("#P/es6/number/parse-int")('2.1') is 2
  require("#P/es6/number/constructor")
  ok \isNaN of require("#P/es6/number/statics")
  ok \isNaN of require("#P/es6/number")
  ok require("#P/es6/object/assign")({q: 1}, {w: 2}).w is 2
  ok require("#P/es6/object/freeze") {}
  ok require("#P/es6/object/get-own-property-descriptor")({q: 1}, \q).enumerable
  ok require("#P/es6/object/get-own-property-names")(q : 42).0 is \q
  ok require("#P/es6/object/get-own-property-symbols")((Symbol!) : 42).length is 1
  ok require("#P/es6/object/get-prototype-of")([]) is Array::
  ok require("#P/es6/object/is") NaN, NaN
  ok require("#P/es6/object/is-extensible") {}
  ok !require("#P/es6/object/is-frozen") {}
  ok !require("#P/es6/object/is-sealed") {}
  ok require("#P/es6/object/keys")(q: 0).0 is \q
  ok require("#P/es6/object/prevent-extensions") {}
  require("#P/es6/object/prototype")
  ok require("#P/es6/object/seal") {}
  ok require("#P/es6/object/set-prototype-of")({}, []) instanceof Array
  ok \keys of require("#P/es6/object/statics-accept-primitives")
  ok \keys of require("#P/es6/object")
  ok require("#P/es6/reflect/apply")(((a, b)-> a + b), null, [1, 2]) is 3
  ok require("#P/es6/reflect/construct")(-> @a = 2).a is 2
  require("#P/es6/reflect/define-property")(O = {}, \a {value: 42})
  ok O.a is 42
  ok require("#P/es6/reflect/delete-property") {q: 1}, \q
  ok \next of require("#P/es6/reflect/enumerate") {}
  ok require("#P/es6/reflect/get")({q: 1}, \q) is 1
  ok require("#P/es6/reflect/get-own-property-descriptor")({q: 1}, \q).enumerable
  ok require("#P/es6/reflect/get-prototype-of")([]) is Array::
  ok require("#P/es6/reflect/has")({q: 1}, \q)
  ok require("#P/es6/reflect/is-extensible") {}
  ok require("#P/es6/reflect/own-keys")(q: 1).0 is \q
  ok require("#P/es6/reflect/prevent-extensions") {}
  ok require("#P/es6/reflect/set")({}, \a 42)
  require("#P/es6/reflect/set-prototype-of")(O = {}, [])
  ok O instanceof Array
  ok \enumerate of require("#P/es6/reflect")
  ok require("#P/es6/string/code-point-at")(\a 0) is 97
  ok require("#P/es6/string/ends-with") \qwe, \we
  ok require("#P/es6/string/from-code-point")(97) is \a
  ok require("#P/es6/string/includes") \qwe, \w
  ok require("#P/es6/string/raw")({raw: \test}, 0, 1, 2) is \t0e1s2t
  ok require("#P/es6/string/repeat")(\q 3) is \qqq
  ok require("#P/es6/string/starts-with") \qwe, \qw
  ok \next of require("#P/es6/string/iterator") \qwe
  ok \repeat of require("#P/es6/string/prototype")
  ok \raw of require("#P/es6/string")
  ok require("#P/es6/symbol/has-instance")
  ok require("#P/es6/symbol/is-concat-spreadable")
  ok require("#P/es6/symbol/iterator")
  ok require("#P/es6/symbol/match")
  ok require("#P/es6/symbol/replace")
  ok require("#P/es6/symbol/search")
  ok require("#P/es6/symbol/species")
  ok require("#P/es6/symbol/split")
  ok require("#P/es6/symbol/to-primitive")
  ok require("#P/es6/symbol/to-string-tag")
  ok require("#P/es6/symbol/unscopables")
  ok typeof require("#P/es6/symbol/for") is \function
  ok typeof require("#P/es6/symbol/key-for") is \function
  ok \iterator of require("#P/es6/symbol")
  require("#P/es6/function")
  require("#P/es6/regexp")
  ok new (require("#P/es6/map"))([[1, 2], [3, 4]]).size is 2
  ok new (require("#P/es6/set"))([1, 2, 3, 2, 1]).size is 3
  ok new (require("#P/es6/weak-map"))([[O = {}, 42]]).get(O) is 42
  ok new (require("#P/es6/weak-set"))([O = {}]).has O
  ok \Map of require("#P/es6/collections")
  ok \all of require("#P/es6/promise")
  ok \Map of require("#P/es6")
  ok require("#P/es7/array/includes")([1 2 3], 2)
  ok \includes of require("#P/es7/array")
  ok require("#P/es7/object/entries")(q: 2).0.0 is \q
  ok require("#P/es7/object/values")(q: 2).0 is 2
  ok \values of require("#P/es7/object/to-array")
  ok require("#P/es7/object/get-own-property-descriptors")(q: 1).q.enumerable
  ok \values of require("#P/es7/object")
  ok require("#P/es7/regexp/escape")('...') is '\\.\\.\\.'
  ok \escape of require("#P/es7/regexp")
  ok require("#P/es7/string/at")(\a 0) is \a
  ok \at of require("#P/es7/string")
  ok require("#P/es7/symbol/reference-get")
  ok require("#P/es7/symbol/reference-set")
  ok require("#P/es7/symbol/reference-delete")
  ok \referenceGet of require("#P/es7/symbol")
  ok \Symbol of require("#P/es7/abstract-refs")
  ok \Symbol of require("#P/es7")
  ok typeof require("#P/js/array/concat") is \function
  ok typeof require("#P/js/array/every") is \function
  ok typeof require("#P/js/array/filter") is \function
  ok typeof require("#P/js/array/for-each") is \function
  ok typeof require("#P/js/array/index-of") is \function
  ok typeof require("#P/js/array/join") is \function
  ok typeof require("#P/js/array/last-index-of") is \function
  ok typeof require("#P/js/array/map") is \function
  ok typeof require("#P/js/array/pop") is \function
  ok typeof require("#P/js/array/push") is \function
  ok typeof require("#P/js/array/reduce") is \function
  ok typeof require("#P/js/array/reduce-right") is \function
  ok typeof require("#P/js/array/reverse") is \function
  ok typeof require("#P/js/array/shift") is \function
  ok typeof require("#P/js/array/slice") is \function
  ok typeof require("#P/js/array/some") is \function
  ok typeof require("#P/js/array/sort") is \function
  ok typeof require("#P/js/array/splice") is \function
  ok typeof require("#P/js/array/unshift") is \function
  ok \unshift of require("#P/js/array/statics")
  ok \unshift of require("#P/js/array")
  ok typeof require("#P/web/set-timeout") is \function
  ok typeof require("#P/web/set-interval") is \function
  ok typeof require("#P/web/set-immediate") is \function
  ok typeof require("#P/web/clear-immediate") is \function
  ok \setTimeout of require("#P/web/timers")
  ok \setImmediate of require("#P/web/immediate")
  ok require("#P/web/dom/iterable")
  ok require("#P/web/dom")
  ok \setImmediate of require("#P/web")
  ok require("#P/core/array/turn")([1, 2, 3], (-> it.q++), {q: 0}).q is 3
  ok \turn of require("#P/core/array")
  ok require("#P/core/string/escape-html")('<br />') is '&lt;br /&gt;'
  ok require("#P/core/string/unescape-html")('&lt;br /&gt;') is '<br />'
  ok \escapeHTML of require("#P/core/string")
  ok require("#P/core/object/is-object") {}
  ok require("#P/core/object/classof")(null) is \Null
  ok require("#P/core/object/define")({}, {q: 42}).q is 42
  ok require("#P/core/object/make")([], {}) instanceof Array
  ok \isObject of require("#P/core/object")
  ok require("#P/core/function/only")((-> &length), 2)(2 3 4) is 2
  ok require("#P/core/function/part")(((a, b, c)-> a + b + c), 2 3)(4) is 9
  ok \part of require("#P/core/function")
  ok \_ of require("#P/core/binding")
  ok require("#P/core/_") is require("#P/core/binding")._
  ok typeof require("#P/core/date/format")(new Date) is \string
  ok typeof require("#P/core/date/format-utc")(new Date) is \string
  ok typeof require("#P/core/date/add-locale") is \function
  ok \format of require("#P/core/date")
  ok require("#P/core/number/random")(0) is 0
  ok \random of require("#P/core/number")
  ok \mapPairs of require("#P/core/dict")
  ok \then of require("#P/core/delay")(1)
  ok require("#P/core/global") is global
  ok \warn of require("#P/core/log")
  ok \of of require("#P/core/$for")([])
  ok require("#P/core/is-iterable")([])
  ok \next of require("#P/core/get-iterator")([])
  ok \delay of require("#P/core")
console.log \OK
