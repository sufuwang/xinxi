<script setup lang="ts">
import { ArrowUpIcon } from 'lucide-vue-next'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group'

definePageMeta({
  layout: false,
})
</script>

<template>
  <div class="flex justify-center h-dvh w-screen items-center">
    <div class="lg:w-[46%] w-screen h-full flex box-border lg:py-2 gap-2">
      <Card class="w-full h-full flex p-2 gap-2 rounded-none md:rounded-xl!">
        <CardHeader class="p-2">
          <CardTitle>Login to your account</CardTitle>
          <!-- <CardDescription>
            Enter your email below to login to your account
          </CardDescription> -->
        </CardHeader>
        <CardContent class="flex-1 px-1 overflow-y-auto">
          <div v-for="value in 30" :key="value" class="flex flex-col gap-4 mb-4 first:mt-6 last:mb-4">
            <div class="w-fit lg:max-w-100 max-w-88 px-3 py-2 wrap-break-word bg-primary/86 text-primary-foreground/95 self-end rounded-[10px_10px_0_10px]">
              这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题
              <span class="mt-1 block text-xs font-light italic text-primary-foreground/85 text-end">
                yyyy-MM-dd HH:mm:ss
              </span>
            </div>
            <div class="w-fit lg:max-w-180 max-w-96 px-3 py-2 wrap-break-word bg-muted self-start rounded-[10px_10px_10px_0]">
              这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案
              <span class="text-foreground/75 mt-1 block text-xs font-light italic">
                yyyy-MM-dd HH:mm:ss
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex flex-col px-0">
          <!-- <div class="text-xs text-[var(--card-foreground)]/60 mb-1">这是一个有温度的 AI ，内容还需自行甄别</div> -->
          <InputGroup>
            <InputGroupTextarea placeholder="Ask, Search or Chat..." />
            <InputGroupAddon align="block-end" class="justify-between">
              <div class="flex gap-2 items-center">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="avatar" />
                  <AvatarFallback>SU</AvatarFallback>
                </Avatar>
                <div>
                  Sufu.Wang
                </div>
              </div>
              <!-- <InputGroupText class="ml-auto">
                这是一个有温度的 AI ，内容还需自行甄别
              </InputGroupText> -->
              <!-- <InputGroupButton
                variant="outline"
                class="rounded-full"
                size="icon-xs"
              >
                <PlusIcon class="size-4" />
              </InputGroupButton>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <InputGroupButton variant="ghost">
                    Auto
                  </InputGroupButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  class="[--radius:0.95rem]"
                >
                  <DropdownMenuItem>Auto</DropdownMenuItem>
                  <DropdownMenuItem>Agent</DropdownMenuItem>
                  <DropdownMenuItem>Manual</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> -->
              <Separator orientation="vertical" class="!h-4" />
              <InputGroupButton
                variant="default"
                class="rounded-full"
                size="icon-sm"
              >
                <ArrowUpIcon class="size-4" />
                <span class="sr-only">Send</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </CardFooter>
      </Card>
      <!-- <div class="w-[36%] flex flex-col gap-2">
        <Card class="w-full h-fit flex p-2 gap-2">
          <CardHeader class="p-2">
            <CardTitle>Login to your account</CardTitle>
          </CardHeader>
          <CardContent class="flex-1 px-1 overflow-y-auto">
            <div>性格分析 / 注意事项</div>
          </CardContent>
        </Card>
        <Card class="w-full h-fit flex p-2 gap-2">
          <CardHeader class="p-2">
            <CardTitle>Login to your account</CardTitle>
          </CardHeader>
          <CardContent class="flex-1 px-1 overflow-y-auto">
            <div>广告</div>
          </CardContent>
        </Card>
      </div> -->
    </div>
  </div>
</template>
