<template>
  <div class="login-container">
    <div class="login-box">
      <div class="avatar-box">
        <!-- logo region -->
        <img src="@/assets/logo.svg" alt="logo" />
        <!-- login form -->
      </div>
      <!-- login form region -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        size="large"
        label-width="0px"
        class="login-form"
      >
        <!-- username -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" :prefix-icon="User" />
        </el-form-item>
        <!-- password -->
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" :prefix-icon="Lock" />
        </el-form-item>
        <!-- login button -->
        <el-form-item class="login-buttons">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { type FormInstance, type FormRules, ElMessage } from 'element-plus'
import axios from 'axios'
import router from '@/router'

interface RuleLoginForm {
  username: string
  password: string
}

// databind object for login form
const loginForm = reactive<RuleLoginForm>({
  username: 'admin',
  password: '123456'
})

// form instance reference
const loginFormRef = ref<FormInstance>()

// rules for login form
const loginFormRules = reactive<FormRules<RuleLoginForm>>({
  username: [
    { required: true, message: '请输入登录名称', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入登录密码', trigger: 'blur' },
    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
  ]
})

// reset login form
const resetLoginForm = () => {
  loginFormRef.value?.resetFields()
}

// login action
const login = () => {
  loginFormRef.value?.validate((valid) => {
    if (!valid) {
      return
    }
    axios.post('/login', loginForm).then((res) => {
      if (res.data.meta.status !== 200) {
        ElMessage.error('登录失败')
        return
      }
      ElMessage.success('登录成功')
      window.sessionStorage.setItem('token', res.data.data.token)
      router.push('/home')
    })
  })
}
</script>

<style lang="less" scoped>
.login-container {
  background-color: #2b4b6b;
  height: 100vh;
}

.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avatar-box {
    border: 1px solid #eee;
    border-radius: 50%;
    height: 130px;
    width: 130px;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

:deep(.login-buttons .el-form-item__content) {
  flex: unset;
}

.login-buttons {
  display: flex;
  justify-content: flex-end;
}

.login-form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
