// the SE-tail peel reaches the inner receiver; the prefix effect stays in place and runs once
export const viaSeTailArg = (({ flat }) => flat)((mark(), [3, [4]]));
