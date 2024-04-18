<template>
    <div>
        <el-config-provider :locale="zhCn">
            <!-- breadcrumb navigation region -->
            <el-breadcrumb :separator-icon="ArrowRight">
                <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>订单管理</el-breadcrumb-item>
                <el-breadcrumb-item>订单列表</el-breadcrumb-item>
            </el-breadcrumb>
            <!-- card view region -->
            <el-card>
                <el-row>
                    <el-col :span="8">
                        <el-input placeholder="请输入内容">
                            <template #append>
                                <el-button :icon="Search" />
                            </template>
                        </el-input>
                    </el-col>
                </el-row>
                <el-table :data="orderList" border stripe>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column prop="order_number" label="订单编号"></el-table-column>
                    <el-table-column prop="order_price" label="订单价格"></el-table-column>
                    <el-table-column prop="pay_status" label="是否付款">
                        <template #default="{ row }">
                            <el-tag type="success" v-if="row.pay_status === '1'">已付款</el-tag>
                            <el-tag type="danger" v-else>未付款</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="is_send" label="是否发货"></el-table-column>
                    <el-table-column prop="create_time" label="下单时间">
                        <template #default="{ row }">
                            {{ formatDate(row.create_time) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template #default>
                            <el-button type="primary" :icon="Edit" @click="showBox" />
                            <el-button type="success" :icon="Location" @click="showProgressBox" />
                        </template>
                    </el-table-column>
                </el-table>
                <!-- pagination region -->
                <el-pagination v-model:current-page="queryInfo.pagenum" v-model:page-size="queryInfo.pagesize"
                    :page-sizes="[5, 10, 15]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </el-card>
            <!-- dialog for change address -->
            <el-dialog v-model="addressVisible" title="修改地址" width="50%" @close="addressDialogClosed">
                <el-form ref="addressFormRef" :model="addressForm" :rules="addressFormRules" label-width="auto">
                    <el-form-item label="省市区/县" prop="address1">
                        <el-cascader style="width: 100%;" v-model="addressForm.address1" :options="cityData"
                            :props="addressCascaderProps" />
                    </el-form-item>
                    <el-form-item label="详细地址" prop="address2">
                        <el-input v-model="addressForm.address2" />
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="addressVisible = false">取 消</el-button>
                        <el-button type="primary" @click="editAddress">
                            确 定
                        </el-button>
                    </div>
                </template>
            </el-dialog>
            <el-dialog v-model="progressVisible" title="物流进度" width="50%">
                <el-timeline>
                    <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
                        {{ activity.context }}
                    </el-timeline-item>
                </el-timeline>
            </el-dialog>
        </el-config-provider>
    </div>
</template>

<script setup lang="ts">
import { ArrowRight, Search, Edit, Location } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import type { FormRules, FormInstance } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import formatDate from '@/utils/dateFormatter';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import cityDataList from './citydata.js';
import progressMock from '@/utils/progressMock';

const queryInfo = reactive({
    query: '',
    pagenum: 1,
    pagesize: 10
});

const orderList = ref([]);

const total = ref(0);

const getOrderList = () => {
    axios.get('/orders', {
        params: queryInfo
    }).then(({ data: res }) => {
        if (res.meta.status !== 200) {
            return ElMessage.error('获取订单列表失败');
        }
        orderList.value = res.data.goods;
        total.value = res.data.total;
    });
};

const addressVisible = ref(false);

const handleSizeChange = (newSize: number) => {
    queryInfo.pagesize = newSize;
    getOrderList();
};

const handleCurrentChange = (newPage: number) => {
    queryInfo.pagenum = newPage;
    getOrderList();
};

interface RuleAddressForm {
    address1: any[];
    address2: string;
}

const addressFormRules = reactive<FormRules<RuleAddressForm>>({
    address1: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
    address2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
});

const cityData = cityDataList;

const addressForm: any = reactive({
    address1: [],
    address2: ''
});

const addressFormRef = ref<FormInstance>();

const addressCascaderProps = {
    expandTrigger: 'hover' as const,
    value: 'value',
    label: 'label',
    children: 'children',
};

const showBox = () => {
    addressVisible.value = true;
};

const addressDialogClosed = () => {
    addressFormRef.value?.resetFields();
};

const editAddress = () => {
    addressFormRef.value?.validate((valid) => {
        if (!valid) {
            return;
        }
        ElMessage.success('修改地址成功');
        addressVisible.value = false;
    });
};

const progressVisible = ref(false);

const progressInfo: any = ref([]);

const showProgressBox = () => {
    progressMock().then((res) => {
        if ((res as any).meta.status !== 200) {
            return ElMessage.error('获取物流进度失败');
        }
        progressInfo.value = (res as any).data;
        progressVisible.value = true;
    });
};

onMounted(() => {
    getOrderList();
});
</script>

<style lang="less" scoped></style>