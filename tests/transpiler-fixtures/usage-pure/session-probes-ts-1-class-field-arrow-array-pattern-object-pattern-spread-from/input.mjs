{
// @ts-expect-error a spread argument tsc cannot place is the shape under test
class K { f = (([{ from }]) => from)(...([[Array]] as any)); }
}
