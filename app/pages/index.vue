<script setup lang="ts">
definePageMeta({
  layout: false,
})
onBeforeMount(() => {
  navigateTo('/chat', { redirectCode: 301, replace: true })
})
</script>

<template>
  <div />
</template>
