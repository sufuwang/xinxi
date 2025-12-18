/* eslint-disable node/prefer-global/process */
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    port: 5173,
  },

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      DIFY_API_KEY: process.env.DIFY_API_KEY,
    },
  },

  css: [
    '~/assets/css/tailwind.css',
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
    },
  ],

  modules: [
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    '@nuxtjs/mdc',
  ],

  mdc: {
    headings: {
      anchorLinks: false,
    },
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "~/components/ui"
     */
    componentDir: '~/components/ui',
  },

  colorMode: {
    classSuffix: '',
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  fonts: {
    defaults: {
      weights: [300, 400, 500, 600, 700, 800],
    },
  },

  routeRules: {
    '/components': { redirect: '/components/accordion' },
    '/settings': { redirect: '/settings/profile' },
    '/dify/**': { proxy: 'https://dify.sufu.site/v1/**' },
    '/x/**': {
      // proxy: 'http://localhost:3000/**',
      proxy: 'https://x.sufu.site/**',
    },
    '/robot': {
      proxy: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${process.env.WECHAT_ROBOT_KEY}`,
    },
  },

  imports: {
    dirs: [
      './lib',
    ],
  },

  compatibilityDate: '2024-12-14',
})
