<script setup lang="ts">
import type { TabItem } from '#imports'
import { TabMetaInj, computed, inject, storeToRefs, until, useBase, useMetas, useRoute } from '#imports'
const { getMeta } = useMetas()

const baseStore = useBase()
const { tables } = storeToRefs(baseStore)

const route = useRoute()

const activeTab = inject(
  TabMetaInj,
  computed(() => ({} as TabItem)),
)

watch(
  () => route.params.viewId,
  (viewId) => {
    /** wait until table list loads since meta load requires table list **/
    until(tables)
      .toMatch((tables) => tables.length > 0)
      .then(() => {
        getMeta(viewId as string, true)
      })
  },
  { immediate: true },
)
</script>

<template>
  <div class="w-full h-full relative">
    <LazyTabsSmartsheet :active-tab="activeTab" />
  </div>
</template>
