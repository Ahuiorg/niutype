<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '@/components/common/NavBar.vue'
</script>

<template>
  <div class="app-wrapper">
    <!-- 背景装饰元素 -->
    <div class="bg-decorations">
      <div class="decoration decoration-1">●</div>
      <div class="decoration decoration-2">★</div>
      <div class="decoration decoration-3">◆</div>
      <div class="decoration decoration-4">●</div>
      <div class="decoration decoration-5">★</div>
      <div class="decoration decoration-6">●</div>
      <div class="decoration decoration-7">◆</div>
      <div class="decoration decoration-8">★</div>
    </div>
    
    <NavBar />
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 背景装饰容器 */
.bg-decorations {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* 装饰元素基础样式 */
.decoration {
  position: absolute;
  font-size: 2rem;
  opacity: 0.15;
  animation: floatDecoration 20s ease-in-out infinite;
}

.decoration-1 {
  top: 10%;
  left: 5%;
  color: var(--candy-pink);
  font-size: 3rem;
  animation-delay: 0s;
  animation-duration: 25s;
}

.decoration-2 {
  top: 20%;
  right: 10%;
  color: var(--candy-yellow);
  font-size: 2.5rem;
  animation-delay: -5s;
  animation-duration: 22s;
}

.decoration-3 {
  top: 50%;
  left: 3%;
  color: var(--candy-blue);
  font-size: 2rem;
  animation-delay: -10s;
  animation-duration: 28s;
}

.decoration-4 {
  top: 70%;
  right: 5%;
  color: var(--candy-green);
  font-size: 2.5rem;
  animation-delay: -3s;
  animation-duration: 24s;
}

.decoration-5 {
  top: 85%;
  left: 15%;
  color: var(--candy-purple);
  font-size: 1.5rem;
  animation-delay: -8s;
  animation-duration: 20s;
}

.decoration-6 {
  top: 30%;
  left: 85%;
  color: var(--candy-orange);
  font-size: 2rem;
  animation-delay: -12s;
  animation-duration: 26s;
}

.decoration-7 {
  top: 60%;
  left: 90%;
  color: var(--candy-pink);
  font-size: 1.5rem;
  animation-delay: -7s;
  animation-duration: 23s;
}

.decoration-8 {
  top: 40%;
  left: 8%;
  color: var(--candy-yellow);
  font-size: 1.8rem;
  animation-delay: -15s;
  animation-duration: 27s;
}

@keyframes floatDecoration {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-30px) rotate(10deg);
  }
  50% {
    transform: translateY(-15px) rotate(-5deg);
  }
  75% {
    transform: translateY(-40px) rotate(5deg);
  }
}

/* 页面过渡动画 */
.page-enter-active {
  animation: pageIn 0.4s ease-out;
}

.page-leave-active {
  animation: pageOut 0.3s ease-in;
}

@keyframes pageIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pageOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
}

/* 减弱动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .decoration {
    animation: none;
  }
  
  .page-enter-active,
  .page-leave-active {
    animation: none;
    transition: opacity 0.2s ease;
  }
  
  .page-enter-from,
  .page-leave-to {
    opacity: 0;
  }
}
</style>
