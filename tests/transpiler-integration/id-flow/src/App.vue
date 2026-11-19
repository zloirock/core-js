<template><div>{{ message }}</div></template>

<script setup lang="ts">
// the SFC script block's own feature: nothing else in the project uses `replaceAll`, so the
// injection that lands here can only have come from this block's id being admitted
const message: string = 'ab'.replaceAll('a', 'b');
</script>

<style scoped>
div { color: red; }
</style>
