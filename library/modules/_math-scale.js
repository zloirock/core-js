// https://rwaldron.github.io/proposal-math-extensions/
module.exports = Math.scale || function scale(x, inLow, inHigh, outLow, outHigh) {
  // eslint-disable-next-line no-self-compare
  if(arguments.length === 0 || x != x || inLow != inLow || inHigh != inHigh || outLow != outLow || outHigh != outHigh){
    return NaN;
  }

  if(x === Infinity || x === -Infinity){
    return x;
  }

  return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
};
