const result = (function f(n) { return n <= 0 ? [] : f(n - 1); })(5);
result.at(0);
