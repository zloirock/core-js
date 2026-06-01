// catch-default IIFE arrow whose body is a binary expr (`[1].at(0) + 1`) is a STRICT SUPERSET of
// the inner `.at` call, so relocating the default composes `.at` as an inner-substitution inside
// the body-wrap (distinct from the equal-range-dup path where body and call cover the same range)
try {} catch ({ [Symbol.iterator]: it = (() => [1].at(0) + 1)() }) { it; }
