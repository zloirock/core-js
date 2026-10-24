{
const boundKey = 'w'; const viaBoundKeyIife = (({ [boundKey]: { at: m } }) => m)({ w: [1, 2] }); use(viaBoundKeyIife);
}
