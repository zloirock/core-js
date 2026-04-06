// function/class declaration names
function Promise() {}
class Map {}

// catch clause parameter
try {} catch (Promise) {}

// for-in/for-of left (assignment target)
var x;
for (x in { Promise: 1 }) {}
for (x of [1]) {}

// export specifier exported name
var y = 1;
export { y as Promise };

// object literal property keys (non-computed, non-shorthand)
var obj = { Promise: 1 };
var obj2 = { Promise() {} };

// class method name
class C {
  Promise() {}
}

// labeled statement label name (not body)
Promise: for (;;) break Promise;
Map: while (true) continue Map;
