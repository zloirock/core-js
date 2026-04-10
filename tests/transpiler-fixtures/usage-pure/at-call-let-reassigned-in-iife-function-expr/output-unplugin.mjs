import _atMaybeString from "@core-js/pure/actual/string/instance/at";
let x = [];
(function() { x = "hello"; })();
_atMaybeString(x).call(x, -1);