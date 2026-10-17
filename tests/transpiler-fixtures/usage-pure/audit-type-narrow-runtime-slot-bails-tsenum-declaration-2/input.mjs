// every non-`+` arithmetic operator COERCES to a number (`'3' * '2'` is 6) - operand
// kinds must not leak a string narrow onto the numeric runtime value
enum E2 { N = '3' * '2' }
