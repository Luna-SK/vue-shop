<template>
    <div>
        <el-config-provider :locale="zhCn">
            <!-- breadcrumb navigation region -->
            <el-breadcrumb :separator-icon="ArrowRight">
                <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>商品管理</el-breadcrumb-item>
                <el-breadcrumb-item>商品列表</el-breadcrumb-item>
            </el-breadcrumb>
            <!-- card view region -->
            <el-card>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                            <template #append>
                                <el-button :icon="Search" @click="getGoodsList" />
                            </template>
                        </el-input>
                    </el-col>
                    <el-col :span="4">
                        <el-button type="primary" @click="goAddPage" >添加商品</el-button>
                    </el-col>
                </el-row>
                <el-table :data="goodsList" border stripe>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                    <el-table-column label="商品价格" prop="goods_price" width="90px"></el-table-column>
                    <el-table-column label="商品重量" prop="goods_weight" width="90px"></el-table-column>
                    <el-table-column label="创建时间" prop="add_time" width="160px">
                        <template #default="{ row }">
                            {{ formatDate(row.add_time) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="130px">
                        <template #default="{ row }">
                            <el-button type="primary" :icon="Edit" />
                            <el-button type="danger" :icon="Delete" @click="removeById(row.goods_id)" />
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination v-model:current-page="queryInfo.pagenum" v-model:page-size="queryInfo.pagesize"
                    :page-sizes="[5, 10, 15, 20]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" background />
            </el-card>
        </el-config-provider>
    </div>
</template>

<script setup lang="ts">
import { ArrowRight, Search, Edit, Delete } from '@element-plus/icons-vue';
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import formatDate from '@/utils/dateFormatter';
import { ElMessage, ElConfigProvider, ElMessageBox } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import router from '@/router';

const queryInfo = reactive({
    query: '',
    pagenum: 1,
    pagesize: 10
});

const goodsList = ref([]);

const total = ref(0);

const getGoodsList = () => {
    axios.get('/goods', {
        params: queryInfo
    }).then(({ data: res }) => {
        if (res.meta.status !== 200) {
            return ElMessage.error('获取商品列表失败');
        }
        console.log(res.data);
        goodsList.value = res.data.goods;
        total.value = res.data.total;
    });
};

const handleSizeChange = (newSize: number) => {
    queryInfo.pagesize = newSize;
    getGoodsList();
};

const handleCurrentChange = (newPage: number) => {
    queryInfo.pagenum = newPage;
    getGoodsList();
};

const removeById = (id: number) => {
    ElMessageBox.confirm('是否删除该商品?', '提示', {
        type: 'warning'
    }).then(() => {
        axios.delete(`/goods/${id}`).then(({ data: res }) => {
            if (res.meta.status !== 200) {
                return ElMessage.error('删除商品失败');
            }
            ElMessage.success('删除商品成功');
            getGoodsList();
        });
    }).catch(() => {
        ElMessage.info('已取消删除');
    });
};

const goAddPage = () => {
    router.push('/goods/add');
};

onMounted(() => {
    getGoodsList();
});
</script>

<style lang="less" scoped></style>