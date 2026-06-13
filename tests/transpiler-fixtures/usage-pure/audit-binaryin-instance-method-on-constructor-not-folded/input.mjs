// `key in Constructor` is a presence check on the constructor OBJECT: an instance (prototype)
// method like `flat` / `includes` is NOT an own property of `Array`, so the test stays native
// (runtime false) and must NOT fold to true. `at` off the `String` constructor is the same. only a
// genuine static (`from`) folds, as it already did
const hasFlat = 'flat' in Array;
const hasIncludes = 'includes' in Array;
const hasAt = 'at' in String;
const hasFrom = 'from' in Array;
