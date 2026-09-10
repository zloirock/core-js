<!-- a `src=` template is the one shape whose block its plugin hands back as a SEPARATE module,
     markup at pre and the compiled render function at post - an inline template is folded into
     the SFC module instead -->
<template src="./tpl.html"></template>

<script lang="ts">
export default { data(): object { return { message: 'tpl' }; } };
</script>
