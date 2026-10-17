// bigint operands flow through the shared operator table - the member is KNOWN bigint,
// so a string-only method name must not inject anything
enum E3 {
  B = 1n * 2n
}
use(E3.B.padEnd(2));