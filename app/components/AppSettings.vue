<script setup lang="ts">
const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
const isDesktop = useMediaQuery('(min-width: 768px)')

const isOpen = ref(false)

const {
  // sidebar,
  updateAppSettings,
} = useAppSettings()

const direction = useTextDirection()

function handleChangeDirection(dir: 'ltr' | 'rtl') {
  direction.value = dir
  updateAppSettings({ sidebar: { side: dir === 'rtl' ? 'right' : 'left' } })
}
</script>

<template>
  <DefineTemplate>
    <div class="space-y-3">
      <Badge>布局</Badge>
      <div class="grid gap-6">
        <!-- <div class="space-y-1.5">
          <Label>导航栏类型</Label>
          <div class="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              :class="{ 'border-primary! border-2 bg-primary/10!': sidebar?.variant === 'sidebar' }"
              @click="updateAppSettings({ sidebar: { variant: 'sidebar' } })"
            >
              Sidebar
            </Button>
            <Button
              variant="outline"
              :class="{ 'border-primary! border-2 bg-primary/10!': sidebar?.variant === 'floating' }"
              @click="updateAppSettings({ sidebar: { variant: 'floating' } })"
            >
              Floating
            </Button>
            <Button
              variant="outline"
              :class="{ 'border-primary! border-2 bg-primary/10!': sidebar?.variant === 'inset' }"
              @click="updateAppSettings({ sidebar: { variant: 'inset' } })"
            >
              Inset
            </Button>
          </div>
        </div> -->
        <div class="space-y-1.5">
          <Label>方向</Label>
          <div class="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              :class="{ 'border-primary! border-2 bg-primary/10!': direction === 'ltr' }"
              @click="handleChangeDirection('ltr')"
            >
              Left To Right
            </Button>
            <Button
              variant="outline"
              :class="{ 'border-primary! border-2 bg-primary/10!': direction === 'rtl' }"
              @click="handleChangeDirection('rtl')"
            >
              Right To Left
            </Button>
          </div>
        </div>
      </div>
    </div>
  </DefineTemplate>

  <Sheet v-if="isDesktop" v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button class="fixed top-1/2 z-50" :class="direction === 'rtl' ? '-left-3 pl-6' : '-right-3 pr-6'">
        <Icon name="i-lucide-settings" class="animate-spin-slow" size="18" />
      </Button>
    </SheetTrigger>
    <SheetContent :side="direction === 'rtl' ? 'left' : 'right'">
      <SheetHeader class="p-6 pb-0">
        <SheetTitle>系统设置</SheetTitle>
        <!-- <SheetDescription>Customize & Preview in Real Time</SheetDescription> -->
      </SheetHeader>
      <ScrollArea class="h-[calc(100vh-100px)]">
        <div class="flex flex-col gap-6 px-6">
          <div class="space-y-3">
            <Badge>主题</Badge>
            <ThemeCustomize />
          </div>
          <Separator />
          <ReuseTemplate />
        </div>
      </ScrollArea>
    </SheetContent>
  </Sheet>

  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger as-child>
      <Button class="fixed top-1/2 z-50 pr-6 -right-3">
        <Icon name="i-lucide-settings" class="animate-spin-slow" size="18" />
      </Button>
    </DrawerTrigger>
    <DrawerContent class="max-h-[97%]">
      <DrawerHeader class="text-center sm:text-center">
        <DrawerTitle>系统设置</DrawerTitle>
        <!-- <DrawerDescription>Customize & Preview in Real Time</DrawerDescription> -->
      </DrawerHeader>
      <div class="mx-auto max-w-md w-full overflow-auto overflow-y-auto px-4 pb-6 space-y-6">
        <div class="space-y-3">
          <Badge>主题</Badge>
          <ThemeCustomize />
        </div>
        <Separator />
        <ReuseTemplate />
      </div>
    </DrawerContent>
  </Drawer>
</template>

<style scoped>

</style>
