<template>
    <div>
        <!-- breadcrumb navigation region -->
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- table region -->

            <!-- pagination region -->

        </el-card>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const getCateList = () => {
    axios.get('categories').then(({ data: res }) => {
        if (res.meta.status !== 200) {
            return ElMessage.error('获取商品分类列表失败');
        }
        console.log(res);
    });
};

onMounted(() => {
    getCateList();
});
</script>

<style lang="less" scoped></style>