<script setup lang="ts">
import { format } from 'date-fns'
import { ArrowDownToLine, ArrowUpIcon, ArrowUpToLine, ChevronsDownUp, ChevronsUpDown, Eye, EyeOff, Menu, MessageCirclePlus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
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

  [&>:first-child]:pt-0! [&>:first-child]:mt-0!
  [&>:last-child]:pb-0! [&>:last-child]:mb-0!
`

const dify_user = 'Dev.Sufu.Wang'
// const conversationId = 'b2026e48-5238-4ddc-abe1-f8b2413567cc'

const placeholders = [
  '我是一个有温度的 AI',
  '你可以向我分享所有困惑和快乐',
  '你有什么要和我说的吗',
]
const nickname = 'Sufu.Wang'
const avatarUrl = 'https://github.com/shadcn.png'

const isMounting = ref(true)
const loading = ref(false)
const query = ref('')
const placeholder = ref(getPlaceholder())
const showTitle = ref(true)
const showInput = ref(true)
const messagesRef = useTemplateRef('messagesRef')
const conversationId = ref('')
const allConversation = ref<Conversation[]>()
const curConversation = ref<Conversation | null>()
const messages = ref<Message[]>([])

const route = useRoute()

function getPlaceholder() {
  const index = Math.max(0, Math.floor(Math.random() * placeholders.length))
  return placeholders[index] ?? placeholders.at(-1)
}

watch(
  () => route.query,
  async () => {
    conversationId.value = route.query.conversationId as string
    await Promise.all([getConversationInfo(), getHistory()])
    setTimeout(() => {
      scroll('end')
    }, 500)
  },
)

onBeforeMount(() => {
  setInterval(() => {
    placeholder.value = getPlaceholder()
  }, 5000)
})
onMounted(async () => {
  conversationId.value = route.query.conversationId as string
  await Promise.all([getConversationInfo(), getHistory()])
  isMounting.value = false
  setTimeout(() => {
    scroll('end')
  }, 500)
})

function warning(text: string) {
  toast.warning(text, { position: 'top-center', richColors: true })
}
function scroll(block: 'start' | 'end' = 'end') {
  messagesRef.value?.scrollIntoView({ behavior: 'smooth', block })
}
async function getConversationInfo() {
  const { data } = await http.get<Conversation[]>(
    `/dify/conversations?user=${dify_user}`,
    {
      headers: { Authorization: 'Bearer app-3WQzNKyBOSjF8dFlIzP8oHRw' },
    },
  )
  allConversation.value = data
  if (!conversationId.value) {
    curConversation.value = null
    return
  }
  curConversation.value = data.find(row => row.id === conversationId.value)
  if (!curConversation.value) {
    warning('当前会话不存在，将跳转至新会话')
    setTimeout(() => {
      window.location.href = '/chat'
    }, 1500)
  }
}
async function getHistory() {
  if (!conversationId.value) {
    messages.value = []
    return
  }
  loading.value = true
  const { data } = await http.get<Message[]>(
    `/dify/messages?user=${dify_user}&conversation_id=${conversationId.value}`,
    {
      headers: { Authorization: 'Bearer app-3WQzNKyBOSjF8dFlIzP8oHRw' },
    },
  )
  messages.value = data.filter(row => row.query && row.answer)
  loading.value = false
}
async function onSend() {
  if (query.value.length === 0) {
    warning('请输入问题')
    return
  }
  loading.value = true
  const response = await fetch('/dify/chat-messages', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer app-3WQzNKyBOSjF8dFlIzP8oHRw',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query: query.value,
      response_mode: 'streaming',
      user: dify_user,
      conversation_id: conversationId.value,
    }),
  })
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      loading.value = false
      break
    };
    const rows: Message[] = decoder.decode(value)
      .split('\n')
      .filter(r => r && r.startsWith('data: ') && r.includes(`"event":"message"`))
      .map(r => JSON.parse(r.replace('data: ', '')))
    if (rows.length === 0) {
      continue
    }
    const history = messages.value
    if (history.at(-1)?.id === rows[0]?.id) {
      messages.value = [
        ...history.slice(0, -1),
        { ...history.at(-1), ...rows[0]!, answer: history.at(-1)?.answer + rows.map(r => r.answer).join('') },
      ]
      scroll('end')
    }
    else {
      messages.value = [...history, { ...rows[0]!, answer: rows.map(r => r.answer).join(''), query: query.value }]
      query.value = ''
    }
  }
}
</script>

<template>
  <div v-if="!isMounting" class="flex justify-center h-dvh w-screen items-center">
    <div class="lg:w-[46%] w-screen h-full flex box-border lg:py-2 gap-2">
      <Card class="w-full h-full flex p-2 gap-2 rounded-none md:rounded-xl!">
        <CardHeader v-if="showTitle" class="p-2">
          <CardTitle>{{ curConversation?.name ?? '' }}</CardTitle>
          <CardDescription v-if="curConversation?.introduction">
            {{ curConversation?.introduction }}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex-1 px-1 overflow-y-auto h-full">
          <div v-if="messages.length" ref="messagesRef">
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
          </div>
          <div v-else class="h-full flex items-center">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="default">
                  <Avatar class="size-12">
                    <AvatarImage :src="avatarUrl" alt="avatar" />
                    <AvatarFallback>SU</AvatarFallback>
                  </Avatar>
                </EmptyMedia>
                <EmptyTitle>{{ nickname }}</EmptyTitle>
                <EmptyDescription>
                  欢迎使用云栖<br>
                  这是一个有温度的 AI<br>
                  您可以倾诉任何事情<br>
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        </CardContent>
        <CardFooter class="flex flex-col px-0">
          <!-- <div class="text-xs text-[var(--card-foreground)]/60 mb-1">这是一个有温度的 AI ，内容还需自行甄别</div> -->
          <InputGroup>
            <InputGroupTextarea v-show="showInput" v-model="query" :placeholder="placeholder" />
            <InputGroupAddon align="block-end" class="justify-between" :class="{ 'p-2': !showInput }">
              <div class="flex gap-2 items-center">
                <Avatar>
                  <AvatarImage :src="avatarUrl" alt="avatar" />
                  <AvatarFallback>SU</AvatarFallback>
                </Avatar>
                <div>
                  {{ nickname }}
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
              <!-- <Separator orientation="vertical" class="!h-4" /> -->

              <div class="flex flex-row gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="outline"
                      size="icon-sm"
                    >
                      <Menu />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>所有会话</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem v-for="row in allConversation" :key="row.id">
                        <NuxtLink :to="{ path: '/chat', query: { conversationId: row.id } }" class="flex flex-row items-center gap-2">
                          <div v-if="row.id === curConversation?.id" class="w-2 h-2 mx-1 rounded-full bg-primary animate-pulse" />
                          {{ row.name }}
                        </NuxtLink>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <NuxtLink :to="{ path: '/chat' }" class="flex flex-row items-center gap-2">
                        <MessageCirclePlus />新建会话
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="showTitle = !showTitle">
                      <template v-if="showTitle">
                        <EyeOff />隐藏会话标题
                      </template>
                      <template v-else>
                        <Eye />显示会话标题
                      </template>
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="showInput = !showInput">
                      <template v-if="showInput">
                        <ChevronsDownUp />隐藏输入框
                      </template>
                      <template v-else>
                        <ChevronsUpDown />显示输入框
                      </template>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="scroll('start')">
                      <ArrowUpToLine />滚动至顶端
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="scroll('end')">
                      <ArrowDownToLine />滚动至底部
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ButtonGroup>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    @click="scroll('start')"
                  >
                    <ArrowUpToLine />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    @click="showInput = !showInput"
                  >
                    <ChevronsDownUp v-if="showInput" />
                    <ChevronsUpDown v-else />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    @click="scroll('end')"
                  >
                    <ArrowDownToLine />
                  </Button>
                </ButtonGroup>
                <InputGroupButton
                  v-if="showInput"
                  variant="default"
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
              </div>
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
