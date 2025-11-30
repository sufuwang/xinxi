<script setup lang="ts">
import { format } from 'date-fns'
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
import { Spinner } from '@/components/ui/spinner'
import http from '@/lib/http'

definePageMeta({
  layout: false,
})

interface Conversation {
  id: string
  introduction: string
  name: string
  status: 'normal'
  created_at: number
  updated_at: number
}
interface Message {
  answer: string
  conversation_id: string
  created_at: number
  id: string
  query: string
  status: 'normal'
}

const MarkdownClass = `
  text-[0.9rem]

  text-gray-800 dark:text-gray-200 leading-relaxed

  [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mt-6 [&>h1]:mb-4
  [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-5 [&>h2]:mb-3
  [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-2
  [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:mt-4 [&>h4]:mb-2

  [&>p]:my-3
  [&>ul]:list-disc [&>ul]:ml-6 [&>ul>li]:my-1
  [&>ol]:list-decimal [&>ol]:ml-6 [&>ol>li]:my-1

  [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500
  [&>blockquote]:pl-4 [&>blockquote]:py-2
  [&>blockquote]:bg-blue-50 dark:[&>blockquote]:bg-blue-900/20
  [&>blockquote]:rounded

  [&_table]:w-fit [&_table]:border-collapse
  [&_th]:border [&_th]:border-[--sidebar-border] [&_th]:p-2 [&_th]:bg-[--muted] [&_th]:text-left
  [&_td]:border [&_td]:border-[--sidebar-border] [&_td]:p-2

  [&>code]:bg-gray-100 dark:[&>code]:bg-gray-800
  [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded text-sm

  [&>pre]:bg-gray-900 dark:[&>pre]:bg-gray-800
  [&>pre]:text-gray-100 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto

  [&>hr]:my-2
`

const dify_user = 'Dev.Sufu.Wang'
const dify_conversation_id = 'b2026e48-5238-4ddc-abe1-f8b2413567cc'

const loading = ref(false)
const query = ref('')
const curConversation = ref<Conversation>()
const messages = ref<Message[]>([])

onMounted(() => {
  Promise.all([
    getConversationInfo(),
    getHistory(),
  ])
})

async function getConversationInfo() {
  // curl -X GET 'http://dify.sufu.site/v1/conversations?user=abc-123&last_id=&limit=20' \
  // --header 'Authorization: Bearer {api_key}'

  const { data } = await http.get<Conversation[]>(
    `/dify/conversations?user=${dify_user}`,
    {
      headers: { Authorization: 'Bearer app-3WQzNKyBOSjF8dFlIzP8oHRw' },
    },
  )
  curConversation.value = data.find(row => row.id === dify_conversation_id)
}
async function getHistory() {
  loading.value = true
  const { data } = await http.get<Message[]>(
    `/dify/messages?user=${dify_user}&conversation_id=${dify_conversation_id}`,
    {
      headers: { Authorization: 'Bearer app-3WQzNKyBOSjF8dFlIzP8oHRw' },
    },
  )
  messages.value = data.filter(row => row.query && row.answer)
  loading.value = false
}

function onSend() {
}
</script>

<template>
  <div class="flex justify-center h-dvh w-screen items-center">
    <div class="lg:w-[46%] w-screen h-full flex box-border lg:py-2 gap-2">
      <Card class="w-full h-full flex p-2 gap-2 rounded-none md:rounded-xl!">
        <CardHeader class="p-2">
          <CardTitle>{{ curConversation?.name ?? '' }}</CardTitle>
          <!-- <CardDescription>
            Enter your email below to login to your account
          </CardDescription> -->
        </CardHeader>
        <CardContent class="flex-1 px-1 overflow-y-auto">
          <div v-for="row in messages" :key="row.id" class="flex flex-col gap-4 mb-4 first:mt-6 last:mb-4">
            <div class="w-fit lg:max-w-100 max-w-88 text-[0.9rem] px-3 py-2 wrap-break-word bg-primary/86 text-primary-foreground/95 self-end rounded-[10px_10px_0_10px]">
              <!-- 这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题\这是问题 -->
              {{ row.query }}
              <span class="mt-1 block text-xs font-light italic text-primary-foreground/85 text-end">
                <!-- yyyy-MM-dd HH:mm:ss -->
                {{ format(row.created_at * 1000, 'yyyy-MM-dd HH:mm:ss') }}
              </span>
            </div>
            <div class="w-fit lg:max-w-180 max-w-96 px-3 py-2 wrap-break-word bg-muted self-start rounded-[10px_10px_10px_0]">
              <!-- 这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案\这是答案 -->
              <MDC :value="row.answer" :class="MarkdownClass" />
              <span class="text-foreground/75 mt-1 block text-xs font-light italic">
                <!-- yyyy-MM-dd HH:mm:ss -->
                {{ format(row.created_at * 1000, 'yyyy-MM-dd HH:mm:ss') }}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex flex-col px-0">
          <!-- <div class="text-xs text-[var(--card-foreground)]/60 mb-1">这是一个有温度的 AI ，内容还需自行甄别</div> -->
          <InputGroup>
            <InputGroupTextarea v-model="query" placeholder="Ask, Search or Chat..." />
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
                :disabled="loading || query.length === 0"
                @click="onSend"
              >
                <Spinner v-if="loading" />
                <template v-else>
                  <ArrowUpIcon class="size-4" />
                  <span class="sr-only">Send</span>
                </template>
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
