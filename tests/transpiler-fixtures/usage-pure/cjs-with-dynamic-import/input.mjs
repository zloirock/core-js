module.exports = async function () {
  const mod = await import('./worker.mjs');
  return Array.from(mod.rows);
};
