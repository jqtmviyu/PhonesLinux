import { defineConfig } from 'vitepress'

import { getSidebar } from 'vitepress-plugin-auto-sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Phones Linux',
  description: '手机移植服务器教程',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [{ icon: 'github', link: 'https://github.com/jqtmviyu/PhonesLinux' }],
    search: {
      provider: 'local'
    },
    outlineTitle: '页面导航',
    docFooter: {
      prev:"上一页",
      next:"下一页",
    },
    outline: {level: [2,6]},

    nav: [
      { text: '首页', link: '/' },
      { text: '手机', link: '/手机/' },
      { text: '随身wifi', link: '/随身wifi/' },
      { text: 'openwrt', link: '/openwrt/' },
      { text: '关于', link: '/关于/' },
    ],

    sidebar: {
      '/手机': getSidebar({
        contentRoot: '/docs',
        contentDirs: ['手机'],
        collapsible: true,
        collapsed: true,
      }),
      '/随身wifi': getSidebar({
        contentRoot: '/docs',
        contentDirs: ['随身wifi'],
        collapsible: true,
        collapsed: true,
      }),
      '/openwrt': getSidebar({
        contentRoot: '/docs',
        contentDirs: ['openwrt'],
        collapsible: true,
        collapsed: true,
      }),
    },
  },
  vite: {
    assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif', '**/*.zip', '**/*.pdf','**/*.webp'],
  },
  ignoreDeadLinks: true,
})
