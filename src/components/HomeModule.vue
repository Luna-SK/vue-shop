<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="logo">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- aside -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollaspse">|||</div>
        <!-- aside menu -->
        <el-menu :collapse="isCollapse" :collapse-transition="false" active-text-color="#409eff"
          background-color="#333744" text-color="#fff" unique-opened router :default-active="activePath">
          <!-- L1 menu -->
          <el-sub-menu v-for="item in menuList" :key="item.id" :index="item.id + ''">
            <!-- template of L1 menu -->
            <template #title>
              <!-- icon -->
              <UserFilled style="width: 1em; height: 1em; margin-right: 10px" v-if="item.id === 125" />
              <DocumentCopy style="width: 1em; height: 1em; margin-right: 10px" v-else-if="item.id === 145" />
              <Goods style="width: 1em; height: 1em; margin-right: 10px" v-else-if="item.id === 165" />
              <Box style="width: 1em; height: 1em; margin-right: 10px" v-else-if="item.id === 185" />
              <TrendCharts style="width: 1em; height: 1em; margin-right: 10px" v-else-if="item.id === 205" />
              <!-- text -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- L2 menu -->
            <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="'/' + subItem.path"
              @click="savNavState('/' + subItem.path)">
              <!-- icon -->
              <el-icon>
                <Menu />
              </el-icon>
              <!-- text -->
              <span>{{ subItem.authName }}</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <!-- right side main content region -->
      <el-main>
        <!-- router placeholder -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import router from '@/router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';

const logout = () => {
  sessionStorage.removeItem('token');
  router.push('/login');
};

const menuList: any = ref([]);

const getMenuList = async () => {
  const { data: res } = await axios.get('menus');
  if (res.meta.status !== 200) {
    return ElMessage.error('获取菜单列表失败');
  }
  menuList.value = res.data;
};

const isCollapse = ref(false);

// toggle to collapse and expand the aside menu
const toggleCollaspse = () => {
  isCollapse.value = !isCollapse.value;
};

const activePath = ref('');

// save the active state of the navigation
const savNavState = (path: string) => {
  window.sessionStorage.setItem('activePath', path);
  activePath.value = path;
};

onMounted(() => {
  getMenuList();
  activePath.value = window.sessionStorage.getItem('activePath') ?? '';
});
</script>

<style lang="less" scoped>
.home-container {
  height: 100vh;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  color: #fff;
  font-size: 20px;

  >div {
    display: flex;
    align-items: center;

    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;

  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 20px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
