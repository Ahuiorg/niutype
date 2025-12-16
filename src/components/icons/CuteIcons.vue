<script setup lang="ts">
/**
 * 可爱糖果风格图标组件
 * 统一管理项目中的图标，保持风格一致性
 */

interface Props {
  name: string
  size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24
})

const iconSize = typeof props.size === 'number' ? `${props.size}px` : props.size
</script>

<template>
  <span class="cute-icon" :style="{ width: iconSize, height: iconSize }">
    <!-- 首页 -->
    <svg v-if="name === 'home'" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15C15 14.4477 14.5523 14 14 14H10C9.44772 14 9 14.4477 9 15V21H4C3.44772 21 3 20.5523 3 20V10.5Z" fill="url(#home-gradient)" stroke="url(#home-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="8" r="1.5" fill="white" opacity="0.6"/>
      <defs>
        <linearGradient id="home-gradient" x1="3" y1="3" x2="21" y2="21">
          <stop stop-color="#FF9F43"/>
          <stop offset="1" stop-color="#FF6B9D"/>
        </linearGradient>
        <linearGradient id="home-stroke" x1="3" y1="3" x2="21" y2="21">
          <stop stop-color="#FF6B9D"/>
          <stop offset="1" stop-color="#FF9F43"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 键盘/练习 -->
    <svg v-else-if="name === 'keyboard'" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="3" fill="url(#keyboard-gradient)" stroke="url(#keyboard-stroke)" stroke-width="1.5"/>
      <rect x="5" y="8" width="2" height="2" rx="0.5" fill="white" opacity="0.9"/>
      <rect x="9" y="8" width="2" height="2" rx="0.5" fill="white" opacity="0.9"/>
      <rect x="13" y="8" width="2" height="2" rx="0.5" fill="white" opacity="0.9"/>
      <rect x="17" y="8" width="2" height="2" rx="0.5" fill="white" opacity="0.9"/>
      <rect x="6" y="12" width="2" height="2" rx="0.5" fill="white" opacity="0.9"/>
      <rect x="10" y="12" width="4" height="2" rx="0.5" fill="white" opacity="0.9"/>
      <rect x="16" y="12" width="2" height="2" rx="0.5" fill="white" opacity="0.9"/>
      <rect x="8" y="16" width="8" height="1.5" rx="0.75" fill="white" opacity="0.7"/>
      <defs>
        <linearGradient id="keyboard-gradient" x1="2" y1="5" x2="22" y2="19">
          <stop stop-color="#54A0FF"/>
          <stop offset="1" stop-color="#9C88FF"/>
        </linearGradient>
        <linearGradient id="keyboard-stroke" x1="2" y1="5" x2="22" y2="19">
          <stop stop-color="#9C88FF"/>
          <stop offset="1" stop-color="#54A0FF"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 统计/图表 -->
    <svg v-else-if="name === 'stats'" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="url(#stats-bg)" opacity="0.15"/>
      <rect x="5" y="13" width="3" height="7" rx="1.5" fill="url(#stats-bar1)"/>
      <rect x="10.5" y="9" width="3" height="11" rx="1.5" fill="url(#stats-bar2)"/>
      <rect x="16" y="5" width="3" height="15" rx="1.5" fill="url(#stats-bar3)"/>
      <circle cx="6.5" cy="11" r="1" fill="white"/>
      <circle cx="12" cy="7" r="1" fill="white"/>
      <circle cx="17.5" cy="3.5" r="1" fill="white"/>
      <defs>
        <linearGradient id="stats-bg" x1="3" y1="3" x2="21" y2="21">
          <stop stop-color="#54A0FF"/>
          <stop offset="1" stop-color="#5CD859"/>
        </linearGradient>
        <linearGradient id="stats-bar1" x1="5" y1="13" x2="8" y2="20">
          <stop stop-color="#5CD859"/>
          <stop offset="1" stop-color="#54A0FF"/>
        </linearGradient>
        <linearGradient id="stats-bar2" x1="10.5" y1="9" x2="13.5" y2="20">
          <stop stop-color="#54A0FF"/>
          <stop offset="1" stop-color="#9C88FF"/>
        </linearGradient>
        <linearGradient id="stats-bar3" x1="16" y1="5" x2="19" y2="20">
          <stop stop-color="#FF6B9D"/>
          <stop offset="1" stop-color="#FF9F43"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 成就/奖杯 -->
    <svg v-else-if="name === 'trophy'" viewBox="0 0 24 24" fill="none">
      <path d="M6 4H18V8C18 11.3137 15.3137 14 12 14C8.68629 14 6 11.3137 6 8V4Z" fill="url(#trophy-gradient)" stroke="url(#trophy-stroke)" stroke-width="1.5"/>
      <path d="M6 6H4C3.44772 6 3 6.44772 3 7V8C3 9.65685 4.34315 11 6 11" stroke="url(#trophy-handle)" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M18 6H20C20.5523 6 21 6.44772 21 7V8C21 9.65685 19.6569 11 18 11" stroke="url(#trophy-handle)" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M10 14V16H14V14" stroke="url(#trophy-stroke)" stroke-width="1.5"/>
      <path d="M8 20H16" stroke="url(#trophy-stroke)" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 16V20" stroke="url(#trophy-stroke)" stroke-width="1.5"/>
      <circle cx="12" cy="8" r="2" fill="white" opacity="0.5"/>
      <path d="M10 7L12 9L14 7" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
      <defs>
        <linearGradient id="trophy-gradient" x1="6" y1="4" x2="18" y2="14">
          <stop stop-color="#FECA57"/>
          <stop offset="1" stop-color="#FF9F43"/>
        </linearGradient>
        <linearGradient id="trophy-stroke" x1="6" y1="4" x2="18" y2="20">
          <stop stop-color="#FF9F43"/>
          <stop offset="1" stop-color="#FF6B9D"/>
        </linearGradient>
        <linearGradient id="trophy-handle" x1="3" y1="6" x2="6" y2="11">
          <stop stop-color="#FECA57"/>
          <stop offset="1" stop-color="#FF9F43"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 礼物 -->
    <svg v-else-if="name === 'gift'" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="10" width="18" height="11" rx="2" fill="url(#gift-box)" stroke="url(#gift-stroke)" stroke-width="1.5"/>
      <rect x="3" y="7" width="18" height="4" rx="1" fill="url(#gift-lid)" stroke="url(#gift-stroke)" stroke-width="1.5"/>
      <path d="M12 7V21" stroke="url(#gift-ribbon)" stroke-width="2"/>
      <path d="M8 7C8 5.34315 9.34315 4 11 4C11.5523 4 12 4.44772 12 5V7" stroke="url(#gift-bow)" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M16 7C16 5.34315 14.6569 4 13 4C12.4477 4 12 4.44772 12 5V7" stroke="url(#gift-bow)" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="12" cy="5.5" r="1.5" fill="url(#gift-bow)"/>
      <circle cx="7" cy="14" r="1" fill="white" opacity="0.5"/>
      <circle cx="17" cy="17" r="0.8" fill="white" opacity="0.5"/>
      <defs>
        <linearGradient id="gift-box" x1="3" y1="10" x2="21" y2="21">
          <stop stop-color="#FF6B9D"/>
          <stop offset="1" stop-color="#FF9F43"/>
        </linearGradient>
        <linearGradient id="gift-lid" x1="3" y1="7" x2="21" y2="11">
          <stop stop-color="#FF9F43"/>
          <stop offset="1" stop-color="#FF6B9D"/>
        </linearGradient>
        <linearGradient id="gift-stroke" x1="3" y1="7" x2="21" y2="21">
          <stop stop-color="#FF6B9D"/>
          <stop offset="1" stop-color="#9C88FF"/>
        </linearGradient>
        <linearGradient id="gift-ribbon" x1="12" y1="7" x2="12" y2="21">
          <stop stop-color="#FECA57"/>
          <stop offset="1" stop-color="#FF9F43"/>
        </linearGradient>
        <linearGradient id="gift-bow" x1="8" y1="4" x2="16" y2="7">
          <stop stop-color="#FECA57"/>
          <stop offset="1" stop-color="#FF9F43"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 游戏 -->
    <svg v-else-if="name === 'game'" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="12" rx="4" fill="url(#game-gradient)" stroke="url(#game-stroke)" stroke-width="1.5"/>
      <circle cx="7" cy="12" r="2.5" fill="white" opacity="0.9"/>
      <path d="M7 10.5V13.5" stroke="url(#game-dpad)" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M5.5 12H8.5" stroke="url(#game-dpad)" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="15" cy="11" r="1.2" fill="#5CD859"/>
      <circle cx="18" cy="12" r="1.2" fill="#FF6B9D"/>
      <circle cx="15" cy="13" r="1.2" fill="#54A0FF"/>
      <circle cx="7" cy="12" r="0.5" fill="url(#game-dpad)"/>
      <defs>
        <linearGradient id="game-gradient" x1="2" y1="6" x2="22" y2="18">
          <stop stop-color="#9C88FF"/>
          <stop offset="1" stop-color="#54A0FF"/>
        </linearGradient>
        <linearGradient id="game-stroke" x1="2" y1="6" x2="22" y2="18">
          <stop stop-color="#54A0FF"/>
          <stop offset="1" stop-color="#9C88FF"/>
        </linearGradient>
        <linearGradient id="game-dpad" x1="5.5" y1="10.5" x2="8.5" y2="13.5">
          <stop stop-color="#9C88FF"/>
          <stop offset="1" stop-color="#54A0FF"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 时钟/时间 -->
    <svg v-else-if="name === 'clock'" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="url(#clock-gradient)" stroke="url(#clock-stroke)" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="6" fill="white" opacity="0.2"/>
      <path d="M12 7V12L15 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="1.5" fill="white"/>
      <circle cx="12" cy="5" r="0.8" fill="white" opacity="0.6"/>
      <circle cx="12" cy="19" r="0.8" fill="white" opacity="0.6"/>
      <circle cx="5" cy="12" r="0.8" fill="white" opacity="0.6"/>
      <circle cx="19" cy="12" r="0.8" fill="white" opacity="0.6"/>
      <defs>
        <linearGradient id="clock-gradient" x1="3" y1="3" x2="21" y2="21">
          <stop stop-color="#5CD859"/>
          <stop offset="1" stop-color="#54A0FF"/>
        </linearGradient>
        <linearGradient id="clock-stroke" x1="3" y1="3" x2="21" y2="21">
          <stop stop-color="#54A0FF"/>
          <stop offset="1" stop-color="#5CD859"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 星星/积分 -->
    <svg v-else-if="name === 'star'" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L14.4 9.2H22L16 13.8L18.4 21L12 16.4L5.6 21L8 13.8L2 9.2H9.6L12 2Z" fill="url(#star-gradient)" stroke="url(#star-stroke)" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M12 6L13.2 10H17L14 12.5L15 16L12 13.5L9 16L10 12.5L7 10H10.8L12 6Z" fill="white" opacity="0.4"/>
      <circle cx="12" cy="11" r="1" fill="white" opacity="0.8"/>
      <defs>
        <linearGradient id="star-gradient" x1="2" y1="2" x2="22" y2="21">
          <stop stop-color="#FECA57"/>
          <stop offset="1" stop-color="#FF9F43"/>
        </linearGradient>
        <linearGradient id="star-stroke" x1="2" y1="2" x2="22" y2="21">
          <stop stop-color="#FF9F43"/>
          <stop offset="1" stop-color="#FF6B9D"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 火焰/连续 -->
    <svg v-else-if="name === 'fire'" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 8 6 8 10C8 11.5 8.5 13 10 14C9 13 9 11 10 9C10 9 11 12 14 13C17 14 18 11 18 10C18 6 12 2 12 2Z" fill="url(#fire-outer)"/>
      <path d="M12 6C12 6 10 8 10 10C10 11 10.5 12 11.5 12.5C11 12 11 11 11.5 10C11.5 10 12 11 13.5 11.5C15 12 15.5 10.5 15.5 10C15.5 8 12 6 12 6Z" fill="url(#fire-inner)"/>
      <ellipse cx="12" cy="18" rx="5" ry="3" fill="url(#fire-base)" opacity="0.3"/>
      <path d="M9 17C9 15 10 14 12 14C14 14 15 15 15 17C15 19 14 21 12 21C10 21 9 19 9 17Z" fill="url(#fire-bottom)"/>
      <circle cx="11" cy="9" r="0.8" fill="white" opacity="0.6"/>
      <defs>
        <linearGradient id="fire-outer" x1="8" y1="2" x2="18" y2="14">
          <stop stop-color="#FF6B9D"/>
          <stop offset="1" stop-color="#FF9F43"/>
        </linearGradient>
        <linearGradient id="fire-inner" x1="10" y1="6" x2="15.5" y2="12.5">
          <stop stop-color="#FECA57"/>
          <stop offset="1" stop-color="#FF9F43"/>
        </linearGradient>
        <linearGradient id="fire-base" x1="7" y1="18" x2="17" y2="18">
          <stop stop-color="#FF9F43"/>
          <stop offset="1" stop-color="#FF6B9D"/>
        </linearGradient>
        <linearGradient id="fire-bottom" x1="9" y1="14" x2="15" y2="21">
          <stop stop-color="#FF9F43"/>
          <stop offset="1" stop-color="#FF6B9D"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 靶心/准确率 -->
    <svg v-else-if="name === 'target'" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="url(#target-outer)" stroke="url(#target-stroke)" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="6" fill="white" stroke="url(#target-mid)" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="3" fill="url(#target-inner)"/>
      <circle cx="12" cy="12" r="1" fill="white"/>
      <circle cx="14" cy="10" r="1.5" fill="white" opacity="0.4"/>
      <defs>
        <linearGradient id="target-outer" x1="3" y1="3" x2="21" y2="21">
          <stop stop-color="#FF6B9D"/>
          <stop offset="1" stop-color="#FF9F43"/>
        </linearGradient>
        <linearGradient id="target-stroke" x1="3" y1="3" x2="21" y2="21">
          <stop stop-color="#FF9F43"/>
          <stop offset="1" stop-color="#FF6B9D"/>
        </linearGradient>
        <linearGradient id="target-mid" x1="6" y1="6" x2="18" y2="18">
          <stop stop-color="#FF6B9D"/>
          <stop offset="1" stop-color="#FF9F43"/>
        </linearGradient>
        <linearGradient id="target-inner" x1="9" y1="9" x2="15" y2="15">
          <stop stop-color="#FF6B9D"/>
          <stop offset="1" stop-color="#9C88FF"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 文档/字符 -->
    <svg v-else-if="name === 'document'" viewBox="0 0 24 24" fill="none">
      <path d="M6 3H14L18 7V20C18 20.5523 17.5523 21 17 21H6C5.44772 21 5 20.5523 5 20V4C5 3.44772 5.44772 3 6 3Z" fill="url(#doc-gradient)" stroke="url(#doc-stroke)" stroke-width="1.5"/>
      <path d="M14 3V7H18" stroke="url(#doc-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 12H15" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
      <path d="M8 15H13" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <path d="M8 18H11" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
      <circle cx="16" cy="5" r="1" fill="white" opacity="0.4"/>
      <defs>
        <linearGradient id="doc-gradient" x1="5" y1="3" x2="18" y2="21">
          <stop stop-color="#5CD859"/>
          <stop offset="1" stop-color="#54A0FF"/>
        </linearGradient>
        <linearGradient id="doc-stroke" x1="5" y1="3" x2="18" y2="21">
          <stop stop-color="#54A0FF"/>
          <stop offset="1" stop-color="#5CD859"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 日历 -->
    <svg v-else-if="name === 'calendar'" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" fill="url(#cal-gradient)" stroke="url(#cal-stroke)" stroke-width="1.5"/>
      <path d="M3 9H21" stroke="url(#cal-stroke)" stroke-width="1.5"/>
      <path d="M8 3V6" stroke="url(#cal-stroke)" stroke-width="2" stroke-linecap="round"/>
      <path d="M16 3V6" stroke="url(#cal-stroke)" stroke-width="2" stroke-linecap="round"/>
      <rect x="6" y="12" width="3" height="3" rx="0.5" fill="white" opacity="0.8"/>
      <rect x="10.5" y="12" width="3" height="3" rx="0.5" fill="white" opacity="0.6"/>
      <rect x="15" y="12" width="3" height="3" rx="0.5" fill="white" opacity="0.4"/>
      <rect x="6" y="16" width="3" height="3" rx="0.5" fill="white" opacity="0.3"/>
      <defs>
        <linearGradient id="cal-gradient" x1="3" y1="5" x2="21" y2="21">
          <stop stop-color="#54A0FF"/>
          <stop offset="1" stop-color="#9C88FF"/>
        </linearGradient>
        <linearGradient id="cal-stroke" x1="3" y1="3" x2="21" y2="21">
          <stop stop-color="#9C88FF"/>
          <stop offset="1" stop-color="#54A0FF"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 默认图标 -->
    <svg v-else viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="url(#default-gradient)" stroke="url(#default-stroke)" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="3" fill="white" opacity="0.5"/>
      <defs>
        <linearGradient id="default-gradient" x1="3" y1="3" x2="21" y2="21">
          <stop stop-color="#9C88FF"/>
          <stop offset="1" stop-color="#54A0FF"/>
        </linearGradient>
        <linearGradient id="default-stroke" x1="3" y1="3" x2="21" y2="21">
          <stop stop-color="#54A0FF"/>
          <stop offset="1" stop-color="#9C88FF"/>
        </linearGradient>
      </defs>
    </svg>
  </span>
</template>

<style scoped>
.cute-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cute-icon svg {
  width: 100%;
  height: 100%;
}
</style>

