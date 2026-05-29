<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-8">
    <NuxtRouteAnnouncer />
    <h1 class="text-3xl font-bold">MisPuntosCL</h1>

    <Button variant="default" @click="counter.increment()">
      Count is: {{ counter.count }}
    </Button>

    <Button variant="outline" @click="counter.reset()">
      Reset
    </Button>
  </div>
</template>

<script setup lang="ts">
const counter = useCounterStore()
</script>
