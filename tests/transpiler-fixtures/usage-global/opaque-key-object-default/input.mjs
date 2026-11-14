// An unknown key leaves the independent Object default responsible for its static.
const { [key()]: { groupBy } = Object } = source;
use(groupBy);
