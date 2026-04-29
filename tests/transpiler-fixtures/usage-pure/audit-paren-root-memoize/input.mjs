// parenthesised root expression in a destructure that needs memoization: the parens
// must be peeled and the inner expression evaluated once.
(Array).from([1, 2, 3]);
(getArr())?.b.at(0);
