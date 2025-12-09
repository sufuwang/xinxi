<script setup lang="ts">
import { Check, InfoIcon, LoaderCircle, Mails, Menu, Send, Trash2, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import http from '@/lib/http'
import { getMailUrl } from '@/lib/utils'

const open = defineModel<boolean>('open')
const loading = reactive({
  checkEmail: false,
  login: false,
  register: false,
})
const calmDownTime = ref(-1)
const step = ref<'Login' | 'Register' | 'CheckEmail'>('CheckEmail')
const status = ref<'EmailFormatError' | 'VerifyCodeSended' | 'VerifyCodeCalmDown' | 'VerifyCodeError' | 'NicknameTooShort' | 'PasswordError' | 'PasswordTooShort' | 'PasswordFormatError' | 'PasswordInconsistent' | 'UserNotFound' | 'Success'>()
const form = reactive({
  email: '',
  verifyCode: '',
  nickname: '',
  password: '',
  confirmPassword: '',
})

const loadingSubmit = computed(() => loading.checkEmail || loading.login || loading.register)

onMounted(() => {
  // step.value = 'Register'
  // type.value = 'Login'
})

watch(() => form.email, () => {
  if (status.value === 'EmailFormatError') {
    status.value = undefined
  }
  const isRight = /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]|(?:[a-z0-9\-]+\.)+[a-z0-9]{2,})$/i.test(form.email)
  if (!isRight) {
    status.value = 'EmailFormatError'
  }
})
watch(() => form.nickname, () => {
  if (status.value === 'NicknameTooShort' && form.nickname.length >= 8) {
    status.value = undefined
  }
})
watch([
  () => form.password,
  () => form.confirmPassword,
], () => {
  if (form.password.length < 8) {
    status.value = 'PasswordTooShort'
  }
  else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    status.value = 'PasswordFormatError'
  }
  else if (form.password !== form.confirmPassword) {
    status.value = 'PasswordInconsistent'
  }
  else {
    status.value = undefined
  }
})
watch(() => form.verifyCode, () => {
  if (status.value === 'VerifyCodeError') {
    status.value = undefined
  }
})

async function sendVerifyCode() {
  if (calmDownTime.value > 0) {
    toast.success(`${calmDownTime.value} 秒后，可以重新发送验证码`, { position: 'top-center', richColors: true })
    return
  }
  const { data } = await http.post('/x/user/send-verifyCode', { email: form.email })
  calmDownTime.value = +data.time >= 1 ? +data.time : -1
  const id = setInterval(() => {
    calmDownTime.value -= 1
    if (calmDownTime.value === 0) {
      clearInterval(id)
    }
  }, 1000)
  if (data.status === 'Success') {
    toast.success('验证码已发送', { position: 'top-center', richColors: true })
  }
}
async function openMail() {
  if (!form.email) {
    return
  }
  const { mail } = getMailUrl(form.email)
  window.open(mail)
}
async function checkEmail() {
  loading.checkEmail = true
  try {
    const { data } = await http.post('/x/user/user-existence', { email: form.email })
    if (data.status === 'UserExist') {
      step.value = 'Login'
    }
    else if (data.status === 'UserNotFound') {
      step.value = 'Register'
      sendVerifyCode()
    }
  }
  catch {
    status.value = 'EmailFormatError'
  }
  loading.checkEmail = false
}
async function register() {
  if (form.verifyCode.length < 6) {
    status.value = 'VerifyCodeError'
  }
  else if (!form.nickname || form.nickname.length < 8) {
    status.value = 'NicknameTooShort'
  }
  else if (!form.password || form.password.length < 8) {
    status.value = 'PasswordTooShort'
  }
  else if (form.password !== form.confirmPassword) {
    status.value = 'PasswordInconsistent'
  }
  else {
    loading.register = true
    try {
      const { data } = await http.post('/x/user/register', { source: 'xinxi', username: form.nickname, email: form.email, password: form.password, verifyCode: form.verifyCode })
      if (data.status !== 'Success') {
        status.value = data.status
        return Promise.reject(data)
      }
      localStorage.setItem('user', JSON.stringify(data))
      open.value = false
    }
    finally {
      loading.register = false
    }
  }
}
async function login() {
  const { data } = await http.post('/x/user/login', { email: form.email, password: form.password })
  status.value = data.status
  localStorage.setItem('user', JSON.stringify({ username: data.username }))
}
async function onReset() {
  step.value = 'CheckEmail'
  status.value = undefined
}
async function onConfirm() {
  if (step.value === 'CheckEmail') {
    checkEmail()
  }
  else if (step.value === 'Register') {
    await register()
  }
  else if (step.value === 'Login') {
    await login()
    open.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => open = v">
    <form>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>欢迎使用心栖</DialogTitle>
          <DialogDescription>
            如果您是第一次使用，将自动为您注册账号
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <!-- <InputGroup>
              <InputGroupInput id="email-2" placeholder="shadcn@vercel.com" />
              <InputGroupAddon align="block-start">
                <Label for="email-2" class="text-foreground">
                  Email
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <InputGroupButton
                        variant="ghost"
                        aria-label="Help"
                        class="ml-auto rounded-full"
                        size="icon-xs"
                      >
                        <InfoIcon />
                      </InputGroupButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>We'll use this to send you notifications</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </InputGroupAddon>
            </InputGroup> -->

            <Label for="email">邮箱</Label>
            <InputGroup>
              <InputGroupInput id="email" v-model="form.email" :disabled="step !== 'CheckEmail'" type="email" placeholder="请输入邮箱" />
              <InputGroupAddon align="inline-end">
                <LoaderCircle v-if="loading.checkEmail" class="w-4 text-green-400 animate-spin" />
                <X v-else-if="status === 'EmailFormatError'" class="w-4 text-red-500" />
                <Check v-else-if="step !== 'CheckEmail'" class="w-4 text-green-500" />
              </InputGroupAddon>
            </InputGroup>
            <div v-if="status === 'VerifyCodeSended'" class="text-xs text-right text-green-600">
              验证码已发送
            </div>
            <div v-else-if="status === 'EmailFormatError'" class="text-xs text-right text-red-600">
              邮箱格式错误
            </div>
          </div>
          <template v-if="step === 'Register'">
            <div class="grid gap-2">
              <Label for="otp">邮箱验证码</Label>
              <div class="flex flex-row justify-between items-end">
                <InputOTP id="otp" v-model="form.verifyCode" :maxlength="8">
                  <InputOTPGroup>
                    <InputOTPSlot v-for="key of 6" :key="key" :index="key - 1" :class="{ 'border-red-500': status === 'VerifyCodeError' }" />
                  </InputOTPGroup>
                </InputOTP>
                <div class="flex gap-1">
                  <Button variant="outline" size="icon" :disabled="calmDownTime" @click="sendVerifyCode">
                    <Send />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button
                        variant="outline"
                        size="icon"
                      >
                        <Menu />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem :disabled="calmDownTime > 0" @click="sendVerifyCode">
                        <Send />重新发送验证码
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="openMail">
                        <Mails />打开邮箱
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div v-if="status === 'VerifyCodeError'" class="text-xs text-red-600">
                验证码错误
              </div>
              <div v-if="calmDownTime > 0" class="text-xs">
                {{ calmDownTime }} 秒后，可以重新发送验证码
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="nickname">昵称</Label>
              <InputGroup :class="{ 'border-red-500': status?.startsWith('Nickname') }">
                <InputGroupInput id="nickname" v-model="form.nickname" placeholder="请输入昵称" />
                <InputGroupAddon align="inline-end">
                  <Check v-if="!status && form.nickname.length >= 8" class="w-4 text-green-500" />
                </InputGroupAddon>
              </InputGroup>
              <div v-if="status === 'NicknameTooShort'" class="text-xs text-right text-red-600 gap-0">
                昵称长度最小为 8 位
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="password">密码</Label>
              <InputGroup :class="{ 'border-red-500': status?.startsWith('Password') }">
                <InputGroupInput id="password" v-model="form.password" type="password" placeholder="请输入密码" />
                <InputGroupAddon align="inline-end">
                  <Check v-if="form.confirmPassword && !status" class="w-4 text-green-500" />
                </InputGroupAddon>
              </InputGroup>
              <div v-if="status === 'PasswordTooShort'" class="text-xs text-right text-red-600 gap-0">
                密码长度最小为 8 位
              </div>
              <div v-else-if="status === 'PasswordFormatError'" class="text-xs text-right text-red-600 gap-0">
                密码必须包含至少一个大写字母、一个小写字母和一个数字
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="password-2">验证密码</Label>
              <InputGroup :class="{ 'border-red-500': status?.startsWith('Password') }">
                <InputGroupInput id="password-2" v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" />
                <InputGroupAddon align="inline-end">
                  <X v-if="status === 'PasswordInconsistent'" class="w-4 text-red-500" />
                  <Check v-else-if="form.confirmPassword && !status" class="w-4 text-green-500" />
                </InputGroupAddon>
              </InputGroup>
              <div v-if="status === 'PasswordInconsistent'" class="text-xs text-right text-red-600 gap-0">
                密码不一致
              </div>
            </div>
          </template>
          <template v-else-if="step === 'Login'">
            <div class="grid gap-2">
              <Label for="password">密码</Label>
              <InputGroup :class="{ 'border-red-500': status === 'PasswordError' }">
                <InputGroupInput id="password" v-model="form.password" type="password" placeholder="请输入密码" />
                <InputGroupAddon align="inline-end">
                  <Check v-if="status === 'Success'" class="w-4 text-green-500" />
                  <template v-else-if="status === 'PasswordError'">
                    <InputGroupText class="text-red-500">
                      密码错误
                    </InputGroupText>
                    <X class="w-4 text-red-500" />
                  </template>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </template>
        </div>
        <DialogFooter class="flex flex-row justify-end gap-2">
          <DialogClose v-if="step === 'CheckEmail'" as-child>
            <Button variant="outline">
              取消
            </Button>
          </DialogClose>
          <Button v-if="step !== 'CheckEmail'" variant="outline" :disabled="loadingSubmit" @click="onReset">
            上一步
          </Button>
          <Button type="submit" :disabled="loadingSubmit" :size="loadingSubmit ? 'icon' : 'default'" @click.prevent="onConfirm">
            <LoaderCircle v-if="loadingSubmit" class="animate-spin" />
            <template v-else>
              确认
            </template>
          </Button>
        </DialogFooter>
      </DialogContent>
    </form>
  </Dialog>
</template>
