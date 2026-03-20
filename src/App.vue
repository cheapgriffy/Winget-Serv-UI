<template>
  <div class="scanlines">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

const auth = useAuthStore()
onMounted(() => {
  if (auth.isLoggedIn) auth.fetchMe()
})
</script>
