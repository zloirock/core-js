const copied = { nums: [1], pick() { return this.nums.at(1); } };
const twin = { ...copied, nums: 'xy' };
twin.pick();
