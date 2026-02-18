import { clientEnv } from "@/lib/env/client.env";

const env = clientEnv();

export const blogConfig = {
  title: env.VITE_BLOG_TITLE || "Flare Stack Blog",
  name: env.VITE_BLOG_NAME || "blog",
  author: env.VITE_BLOG_AUTHOR || "作者",
  description:
    env.VITE_BLOG_DESCRIPTION || "这是博客的描述，写一段话介绍一下这个博客，",
  social: {
    github: env.VITE_BLOG_GITHUB || "https://github.com/example",
    email: env.VITE_BLOG_EMAIL || "demo@example.com",
  },

  // 背景图片配置（图片放在 /public/images/ 目录下）
  background: {
    enabled: true,
    imageUrl: "https://static.lbkano.com/background.webp", // 全局背景
    homeImageUrl: "https://static.lbkano.com/bg2.jpg", // 主页背景（可选）
    opacity: 100,
    darkOpacity: 100,
    blur: 0,
    overlayOpacity: 80,
    transitionDuration: 1200,
  },
};

export type BlogConfig = typeof blogConfig;
