<script setup lang="ts">
import { format } from 'date-fns'
import { ArrowDownToLine, ArrowUpToLine, Bot, ChevronsDownUp, ChevronsUpDown, CircleAlert, Eye, EyeOff, LogOut, Mails, Menu, MessageCirclePlus, RotateCcw, Send, Trash2 } from 'lucide-vue-next'
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
import { Character, Tip } from '@/lib/prompt'

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

const MinMessageCountOfAI = 2
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

const placeholders = [
  '我是一个有温度的 AI',
  '你可以向我分享所有困惑和快乐',
  '你有什么要和我说的吗',
]

// const avatarUrl = ref('https://github.com/shadcn.png')
const avatarUrl = ref()
// const dify_user = ref('Dev.Sufu.Wang')
const username = ref('')
const dify_user = ref('')
const openLoginDialog = ref(false)
const isMounting = ref(true)
const query = ref('')
const placeholder = ref(getPlaceholder())
const showTitle = ref(true)
const showInput = ref(true)
const messagesRef = useTemplateRef('messagesRef')
const conversationId = ref('')
const allConversation = ref<Conversation[]>()
const curConversation = ref<Conversation | null>()
const messages = ref<Message[]>([])

const loading = reactive<{ ai: boolean, chat: boolean }>({ chat: false, ai: false })
const ai = reactive<{ character: Message | null, tip: Message | null }>({ character: null, tip: null })

const router = useRouter()
const route = useRoute()
const { public: { DIFY_API_KEY } } = useRuntimeConfig()

function getPlaceholder() {
  const index = Math.max(0, Math.floor(Math.random() * placeholders.length))
  return placeholders[index] ?? placeholders.at(-1)
}

watch(
  () => route.query,
  async () => {
    if (!route.query.conversationId) {
      showInput.value = true
    }
    getUserInfo()
    conversationId.value = route.query.conversationId as string
    await Promise.all([getConversationInfo(), getHistory()])
    setTimeout(() => {
      scroll('end')
    }, 500)
  },
)
watch(openLoginDialog, async () => {
  if (!openLoginDialog.value) {
    getUserInfo()
    await Promise.all([getConversationInfo(), getHistory()])
    setTimeout(() => {
      scroll('end')
    }, 500)
  }
  else {
    router.replace({
      path: route.path,
      query: { ...route.query, conversationId: undefined },
    })
  }
})
watch(messages, async () => {
  ai.character = messages.value.findLast(row => row.query === Character) as Message
  ai.tip = messages.value.findLast(row => row.query === Tip) as Message
}, { deep: true })

onBeforeMount(() => {
  getUserInfo()
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

async function analyze() {
  loading.ai = true
  query.value = Character
  await onSend()
  query.value = Tip
  await onSend()
  query.value = ''
  loading.ai = false
}
function logout() {
  localStorage.removeItem('user')
  router.replace({
    path: route.path,
    query: { ...route.query, conversationId: undefined },
  })
  dify_user.value = ''
  username.value = ''
  conversationId.value = ''
  curConversation.value = null
  allConversation.value = []
  messages.value = []
}
function getUserInfo() {
  const user = JSON.parse(localStorage.getItem('user') ?? '{}')
  dify_user.value = user.dify_user
  username.value = user.username
}
function warning(text: string) {
  toast.warning(text, { position: 'top-center', richColors: true })
}
function scroll(block: 'start' | 'end' = 'end') {
  messagesRef.value?.scrollIntoView({ behavior: 'smooth', block })
}
async function getConversationInfo() {
  if (!dify_user.value) {
    return
  }
  const { data } = await http.get<Conversation[]>(
    `/dify/conversations?user=${dify_user.value}`,
    {
      headers: { Authorization: `Bearer ${DIFY_API_KEY}` },
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
  if (!dify_user.value || !conversationId.value) {
    messages.value = []
    return
  }
  loading.chat = true
  const { data } = await http.get<Message[]>(
    `/dify/messages?user=${dify_user.value}&conversation_id=${conversationId.value}`,
    {
      headers: { Authorization: `Bearer ${DIFY_API_KEY}` },
    },
  )
  messages.value = data.filter(row => row.query && row.answer)
  loading.chat = false
}
async function deleteConversation() {
  await http.delete(
    `/dify/conversations/${conversationId.value}`,
    {
      headers: { Authorization: `Bearer ${DIFY_API_KEY}` },
      data: {
        user: dify_user.value,
      },
    },
  )
  router.replace({ path: '/chat' })
}
async function onSend(_q?: string) {
  if (!dify_user.value) {
    openLoginDialog.value = true
    return
  }
  const q = typeof _q === 'string' && _q.length ? _q : query.value
  if (q.length === 0) {
    warning('请输入问题')
    return
  }
  loading.chat = true
  const response = await fetch('/dify/chat-messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query: q,
      response_mode: 'streaming',
      user: dify_user.value,
      conversation_id: conversationId.value,
    }),
  })
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      loading.chat = false
      break
    }
    try {
      const _rows = decoder.decode(value).split('\n')
      const rows: Message[] = _rows.filter(r => r && r.startsWith('data: ') && r.includes(`"event":"message"`))
        .map(r => JSON.parse(r.replace('data: ', '')))
      if (_rows[0]?.includes(`"event":"message_end"`)) {
        router.replace({
          path: route.path,
          query: { ...route.query, conversationId: conversationId.value },
        })
      }
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
        messages.value = [...history, { ...rows[0]!, answer: rows.map(r => r.answer).join(''), query: q }]
        query.value = ''
        if (!conversationId.value) {
          conversationId.value = rows[0]?.conversation_id ?? ''
          getConversationInfo()
        }
      }
    }
    catch (error) {
      console.error('error: ', error, { value, text: decoder.decode(value) })
    }
  }
}
</script>

<template>
  <div v-if="!isMounting" class="flex justify-center h-dvh w-screen items-center">
    <AuthLogin v-model:open="openLoginDialog" />
    <div class="lg:w-[46%] w-screen h-full flex box-border lg:py-2 gap-2">
      <Card class="w-full h-full flex p-2 gap-2 rounded-none md:rounded-xl!">
        <CardHeader v-if="showTitle" class="p-2 items-center" :class="{ 'gap-0': !curConversation?.introduction }">
          <CardTitle>{{ curConversation?.name ?? '' }}</CardTitle>
          <CardDescription v-if="curConversation?.introduction">
            {{ curConversation?.introduction }}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex-1 px-1 overflow-y-auto h-full">
          <div v-if="messages.length" ref="messagesRef">
            <div
              v-for="row in messages.filter(row => !row.query.startsWith('【PROMPT】'))"
              :key="row.id"
              class="flex flex-col gap-4 mb-4 first:mt-6 last:mb-4"
            >
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
                  <Avatar v-if="avatarUrl" class="size-12">
                    <AvatarImage :src="avatarUrl" alt="avatar" />
                    <AvatarFallback>SU</AvatarFallback>
                  </Avatar>
                </EmptyMedia>
                <EmptyTitle>
                  你好
                  <template v-if="username">
                    ，<b>{{ username }}</b>
                  </template>
                </EmptyTitle>
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
            <InputGroupTextarea v-show="showInput" v-model="query" :placeholder="placeholder" @keydown.enter.prevent="onSend" />
            <InputGroupAddon align="block-end" class="justify-between" :class="{ 'p-2': !showInput }">
              <div class="flex gap-2 items-center">
                <Avatar v-if="avatarUrl">
                  <AvatarImage :src="avatarUrl" alt="avatar" />
                  <AvatarFallback>SU</AvatarFallback>
                </Avatar>
                <div>
                  {{ username }}
                </div>
              </div>
              <div class="flex flex-row gap-2">
                <template v-if="allConversation?.length">
                  <Drawer>
                    <DrawerTrigger as-child>
                      <Button
                        variant="outline"
                        size="icon-sm"
                      >
                        <Bot />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div class="grid gap-2 p-4">
                        <Alert v-if="messages.length < MinMessageCountOfAI">
                          <CircleAlert />
                          <AlertTitle>有效聊天不足</AlertTitle>
                          <AlertDescription>
                            您的聊天记录不足以生成性格分析等信息<br>
                            有效提问 {{ MinMessageCountOfAI }} 次以上，AI 会为您生成<br>
                            当前提问次数为 {{ messages.length }} 次
                          </AlertDescription>
                        </Alert>
                        <template v-else-if="!ai.character && !ai.tip">
                          <Empty>
                            <EmptyHeader>
                              <EmptyMedia variant="icon">
                                <Bot />
                              </EmptyMedia>
                              <EmptyTitle>心栖 AI 分析</EmptyTitle>
                              <EmptyDescription>
                                基于当前对话，分析您的性格特点，并为您提出合理的建议
                              </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                              <Button :disabled="loading.ai" @click="analyze">
                                开始分析
                              </Button>
                            </EmptyContent>
                          </Empty>
                        </template>
                        <template v-else>
                          <Alert v-if="ai.character" class="overflow-y-auto max-h-[30vh]">
                            <AlertTitle class="mb-1 text-primary flex justify-between">
                              性格分析
                              <Button :disabled="loading.ai" class="h-fit" variant="ghost" size="icon-sm" @click="analyze">
                                <RotateCcw :class="{ 'animate-spin': loading.ai }" />
                              </Button>
                            </AlertTitle>
                            <AlertDescription class="gap-0">
                              <MDC :value="ai.character.answer" :class="MarkdownClass" />
                              <span class="text-foreground/75 mt-1 block text-xs font-light italic">
                                {{ format(ai.character.created_at * 1000, 'yyyy-MM-dd HH:mm:ss') }}
                              </span>
                              <!-- <p><strong>需警惕</strong>：</p><ol><li>勿让“帮助他人”成为逃避自我需求的借口</li><li>当连续出现胃部紧绷/肩颈酸痛时，提示情绪承载超限</li><li>避免用“成长”名义强迫自己立刻改变</li></ol><p><strong>可强化</strong>：</p><ol><li>每天留15分钟“无共情时间”（如拼图/编程）</li><li>遇到他人情绪波动时，先问自己：“这是谁的主场？”</li><li>把“绿色圆形”实体化（如口袋里的圆形鹅卵石）</li></ol><p><strong>关键提醒</strong>：你最大的优势（高共情）与最大挑战（边界模糊）实为一体两面，需练习像潮汐般——既能涌向世界，也能退回自己的海岸。</p> -->
                            </AlertDescription>
                          </Alert>
                          <Alert v-if="ai.tip" class="overflow-y-auto max-h-[40vh]">
                            <AlertTitle class="mb-1 text-primary flex justify-between">
                              温馨提示
                              <Button :disabled="loading.ai" class="h-fit" variant="ghost" size="icon-sm" @click="analyze">
                                <RotateCcw :class="{ 'animate-spin': loading.ai }" />
                              </Button>
                            </AlertTitle>
                            <AlertDescription class="gap-0">
                              <MDC :value="ai.tip.answer" :class="MarkdownClass" />
                              <span class="text-foreground/75 mt-1 block text-xs font-light italic">
                                {{ format(ai.tip.created_at * 1000, 'yyyy-MM-dd HH:mm:ss') }}
                              </span>
                              <!-- <p>
                                你具有<strong>高敏感与强共情力</strong>，能敏锐感知他人情绪变化，但易因此过度负荷。内心存在<strong>成长型思维</strong>，习惯用意象化方式（如“绿色圆形”）处理情绪，展现出独特的心理调节天赋。你正从被动承受转向主动建构，在“照顾他人”与“守护自我”间寻找平衡。性格核心矛盾在于：<strong>细腻的觉察力既是滋养关系的礼物，也是消耗能量的缺口</strong>。你追求的韧性并非坚硬对抗，而是学会在柔软中建立弹性边界。
                              </p> -->
                            </AlertDescription>
                          </Alert>
                          <div class="text-xs text-center text-gray-600">
                            以上 AI 分析根据当前会话生成，仅供参考
                          </div>
                        </template>
                      </div>
                    </DrawerContent>
                  </Drawer>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button
                        variant="outline"
                        size="icon-sm"
                      >
                        <Mails />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>所有会话</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          v-for="row in allConversation"
                          :key="row.id"
                          @click="router.push({ path: '/chat', query: { conversationId: row.id } })"
                        >
                          <div v-if="row.id === curConversation?.id" class="w-2 h-2 mx-1 rounded-full bg-primary animate-pulse" />
                          {{ row.name }}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="router.push({ path: '/chat' })">
                        <MessageCirclePlus />新建会话
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="conversationId" @click="deleteConversation">
                        <Trash2 />删除会话
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </template>
                <DropdownMenu v-if="dify_user">
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="outline"
                      size="icon-sm"
                    >
                      <Menu />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <template v-if="messages.length">
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
                      <DropdownMenuSeparator />
                    </template>
                    <DropdownMenuItem @click="logout">
                      <LogOut />退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <template v-if="messages.length">
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
                </template>
                <InputGroupButton
                  v-if="showInput"
                  variant="default"
                  size="icon-sm"
                  :disabled="loading.chat || loading.ai"
                  @click="onSend"
                >
                  <Spinner v-if="loading.chat || loading.ai" />
                  <template v-else>
                    <Send class="size-4" />
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
