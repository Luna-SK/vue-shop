<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'

const logout = () => {
  sessionStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped></style>
