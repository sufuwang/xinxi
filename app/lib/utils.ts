import type { Updater } from '@tanstack/vue-table'
import type { ClassValue } from 'clsx'
import type { Ref } from 'vue'
import axios from 'axios'
import { clsx } from 'clsx'
import { format } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value = typeof updaterOrValue === 'function'
    ? updaterOrValue(ref.value)
    : updaterOrValue
}

export function getMailUrl(mail: string) {
  const Mails = [
    { domain: '163.com', mail: 'https://mail.163.com' },
    { domain: '126.com', mail: 'https://mail.126.com' },
    { domain: 'qq.com', mail: 'https://mail.qq.com' },
    { domain: 'foxmail.com', mail: 'https://mail.qq.com' },
    { domain: 'outlook.com', mail: 'https://outlook.live.com' },
    { domain: 'hotmail.com', mail: 'https://outlook.live.com' },
    { domain: 'sina.com', mail: 'https://mail.sina.com.cn' },
    { domain: 'sina.cn', mail: 'https://mail.sina.com.cn' },
    { domain: 'yahoo.com', mail: 'https://mail.yahoo.com' },
    { domain: 'gmail.com', mail: 'https://mail.google.com' },
  ]
  const row = Mails.find(({ domain }) => mail.endsWith(domain))
  if (row) {
    return row
  }
  const domain = mail.split('@').at(-1)!
  return {
    domain,
    mail: `https://www.baidu.com/s?wd=${domain}`,
  }
}

export function sendTextByRobot(text: string) {
  if (import.meta.env.DEV) {
    return
  }
  return axios.post('/robot', {
    msgtype: 'markdown',
    markdown: {
      content: `${text}\n\n*${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')}*`,
    },
  })
}
