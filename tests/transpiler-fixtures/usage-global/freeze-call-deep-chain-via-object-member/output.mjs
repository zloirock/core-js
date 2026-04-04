const obj = {
  date: new Date()
};
const ref = obj.date;
const d = ref;
Object.freeze(d);