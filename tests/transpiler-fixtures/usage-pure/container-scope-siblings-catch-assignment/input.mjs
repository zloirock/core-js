const holder = { w: Object };
try {
  throw { w: Array };
} catch (holder) {
  holder.w = Map;
}
