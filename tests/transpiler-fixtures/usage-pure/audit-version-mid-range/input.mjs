// mid-range `version: "4.5"` exercises the version gate between 4.0 and 4.999. the
// plugin accepts any semver in the supported v4 range; polyfill dispatch should work
// exactly the same as other v4 versions. baseline: an instance method and a well-known
// constructor polyfill should both emit
const arr = [1, 2, 3];
arr.at(0);
new Map();
