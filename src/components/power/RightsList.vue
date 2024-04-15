<template>
    <div>
        <!-- breadcrumb navigation -->
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- card view -->
        <el-card>
            <el-table :data="rightsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="权限名称" prop="authName"></el-table-column>
                <el-table-column label="路径" prop="path"></el-table-column>
                <el-table-column label="权限等级" prop="level">
                    <template #default="{ row }">
                        <el-tag v-if="row.level === '0'" type="primary">一级</el-tag>
                        <el-tag v-else-if="row.level === '1'" type="success">二级</el-tag>
                        <el-tag v-else-if="row.level === '2'" type="warning">三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const rightsList: any = ref([]);

const getRightsList = () => {
    axios.get('rights/list').then(({ data: res }) => {
        if (res.meta.status !== 200) {
            return ElMessage.error('获取权限列表失败！');
        }
        rightsList.value = res.data;
    });
};

onMounted(() => {
    getRightsList();
});
</script>

<style lang="less" scoped></style>