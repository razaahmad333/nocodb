<script setup lang="ts">
import {
  ActiveViewInj,
  FieldsInj,
  IsPublicInj,
  MetaInj,
  ReadonlyInj,
  ReloadViewDataHookInj,
  createEventHook,
  extractSdkResponseErrorMsg,
  message,
  provide,
  ref,
  useBase,
  useGlobal,
  useProvideSmartsheetStore,
  useSharedView,
} from '#imports'

const { sharedView, meta, sorts, nestedFilters } = useSharedView()

const { signedIn } = useGlobal()

const { loadProject } = useBase()

const { isLocked } = useProvideSmartsheetStore(sharedView, meta, true, sorts, nestedFilters)

const reloadEventHook = createEventHook()

const columns = ref(meta.value?.columns || [])

provide(ReloadViewDataHookInj, reloadEventHook)
provide(ReadonlyInj, ref(true))
provide(MetaInj, meta)
provide(ActiveViewInj, sharedView)
provide(FieldsInj, columns)
provide(IsPublicInj, ref(true))
provide(IsLockedInj, isLocked)

const { loadGridViewColumns } = useProvideGridViewColumn(sharedView, true)

if (signedIn.value) {
  try {
    await loadProject()
  } catch (e: any) {
    console.error(e)
    message.error(await extractSdkResponseErrorMsg(e))
  }
}

watch(
  () => meta.value?.columns,
  () => (columns.value = meta.value?.columns || []),
  {
    immediate: true,
  },
)

onMounted(async () => {
  await loadGridViewColumns()
})
</script>

<template>
  <div class="nc-container flex flex-col h-full mt-1.5 px-12">
    <LazySmartsheetToolbar />
    <LazySmartsheetGrid />
  </div>
</template>

<style scoped>
.nc-container {
  height: 100%;
  padding-bottom: 0.5rem;
  flex: 1 1 100%;
}
</style>
