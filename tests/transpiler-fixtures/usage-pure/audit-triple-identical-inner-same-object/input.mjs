// three identical inner-rewrite sites pointing at the same source object: each
// occurrence must be replaced independently with the right alias.
arr.includes(arr.at(0), arr.at(0), arr.at(0));
