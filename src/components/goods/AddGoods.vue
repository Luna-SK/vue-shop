<template>
    <div>
        <!-- breadcrumb navigation region -->
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- card view region -->
        <el-card>
            <!-- alert region -->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false" />
            <!-- steps region -->
            <el-steps :space="200" :active="activeIndex" finish-status="success" align-center>
                <el-step title="基本信息" />
                <el-step title="商品参数" />
                <el-step title="商品属性" />
                <el-step title="商品图片" />
                <el-step title="商品内容" />
                <el-step title="完成" />
            </el-steps>

            <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="auto" label-position="top"
                status-icon>
                <!-- tabs region -->
                <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave"
                    @tab-change="tabChanged">
                    <el-tab-pane label="基本信息" :name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name" clearable />
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number" clearable />
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number" clearable />
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number" clearable />
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps"
                                @change="handleChange" />
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" :name="1">
                        <!-- render item of form -->
                        <el-form-item v-for="item in manyTableData" :key="item.attr_id"
                            :label="item.attr_name as string">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="checkedLabel" :value="checkedLabel"
                                    v-for="(checkedLabel, index) in item.attr_vals" :key="index" border />
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" :name="2">
                        <el-form-item v-for="item in onlyTableData" :key="item.attr_id"
                            :label="item.attr_name as string">
                            <el-input v-model="item.attr_vals" clearable />
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" :name="3">
                        <!-- action: API address of backend to upload image -->
                        <el-upload :action="api + 'upload'" :on-preview="handlePreview" :on-remove="handleRemove"
                            list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                            <el-button type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" :name="4">
                        <QuillEditor v-model:content="addForm.goods_introduce" />
                        <!-- button to add goods -->
                        <el-button type="primary" size="large" class="btn-add" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- picture preview -->
        <el-dialog v-model="previewVisible" title="图片预览" width="50%">
            <img :src="previewPath" alt="preview" class="preview-image" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';
import { api, host } from '@/utils/serverInfo';
import { QuillEditor } from '@vueup/vue-quill'
import _ from 'lodash';
import router from '@/router';

const activeIndex = ref(0);

const addFormRef = ref<FormInstance>();

interface AddFormRules {
    goods_name: string;
    goods_price: number;
    goods_weight: number;
    goods_number: number;
    goods_cat: any;
}

const addForm: any = reactive({
    goods_name: '',
    goods_price: 0,
    goods_weight: 0,
    goods_number: 0,
    // goods category array
    goods_cat: [],
    // picture array
    pics: [],
    // goods information description
    goods_introduce: '',
    attrs: []
});

const addFormRules = reactive<FormRules<AddFormRules>>({
    goods_name: [
        { required: true, message: '请输入商品名称', trigger: 'blur' }
    ],
    goods_price: [
        { required: true, message: '请输入商品价格', trigger: 'blur' }
    ],
    goods_weight: [
        { required: true, message: '请输入商品重量', trigger: 'blur' }
    ],
    goods_number: [
        { required: true, message: '请输入商品数量', trigger: 'blur' }
    ],
    goods_cat: [
        { required: true, message: '请选择商品分类', trigger: 'change' }
    ]
});

const cateList = ref([]);

const cateProps = {
    expandTrigger: 'hover' as const,
    label: 'cat_name',
    value: 'cat_id',
    children: 'children'
};

// get all categories
const getCateList = () => {
    axios.get('/categories').then(({ data: res }) => {
        if (res.meta.status !== 200) {
            ElMessage.error('获取商品分类失败');
        }
        cateList.value = res.data;
    });
};

// trgiggered when the category changes
const handleChange = () => {
    if (addForm.goods_cat.length !== 3) {
        addForm.goods_cat = [];
    }
};

const beforeTabLeave: any = (activeName: number, oldActiveName: number) => {
    if (oldActiveName === 0 && addForm.goods_cat.length !== 3) {
        ElMessage.error('请先选择商品分类');
        return false;
    }
};

const cateId = computed(() => {
    return addForm.goods_cat.length === 3 ? addForm.goods_cat[2] : null;
});

const manyTableData: any = ref([]);
const onlyTableData: any = ref([]);

const tabChanged = () => {
    if (activeIndex.value === 1) {
        axios.get(`/categories/${cateId.value}/attributes`, {
            params: {
                sel: 'many'
            }
        }).then(({ data: res }) => {
            if (res.meta.status !== 200) {
                ElMessage.error('获取动态参数列表失败！');
            }
            res.data.forEach((item: any) => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
            });
            manyTableData.value = res.data;
        });
    } else if (activeIndex.value === 2) {
        axios.get(`/categories/${cateId.value}/attributes`, {
            params: {
                sel: 'only'
            }
        }).then(({ data: res }) => {
            if (res.meta.status !== 200) {
                ElMessage.error('获取静态属性列表失败！');
            }
            onlyTableData.value = res.data;
        });
    }
};

const previewPath = ref('');

const handlePreview = (file: any) => {
    previewPath.value = host + file.response.data.url.substring(16);
    previewVisible.value = true;
};

const handleRemove = (file: any) => {
    // 1. get temp path of the image to be deleted
    const filePath = file.response.data.tmp_path;
    // 2. find index of the image from pics array
    const index = addForm.pics.findIndex((item: any) => item.pic === filePath);
    // 3. delete the image from pics array using splice method
    addForm.pics.splice(index, 1);
};

const headerObj = reactive({
    Authorization: window.sessionStorage.getItem('token')
});

// monitor the success of uploading image
const handleSuccess = (response: any) => {
    // 1. concatenate to get image info object
    const picInfo = {
        pic: response.data.tmp_path
    };
    // 2. push to the picture array
    addForm.pics.push(picInfo);
};

const previewVisible = ref(false);

const add = () => {
    addFormRef.value?.validate((valid) => {
        if (!valid) {
            ElMessage.error('请填写必要的表单项');
            return;
        }
        // add goods
        // lodash cloneDeep(obj)
        const form = _.cloneDeep(addForm);
        form.goods_cat = form.goods_cat.join(',');
        // handle dynamic parameters
        manyTableData.value.forEach((item: any) => {
            addForm.attrs.push({
                attr_id: item.attr_id,
                attr_value: item.attr_vals.join(' ')
            });
        });
        // handle static attributes
        onlyTableData.value.forEach((item: any) => {
            addForm.attrs.push({
                attr_id: item.attr_id,
                attr_value: item.attr_vals
            });
        });
        form.attrs = [...addForm.attrs];
        form.goods_introduce = form.goods_introduce.ops[0].insert;
        axios.post('/goods', form).then(({ data: res }) => {
            if (res.meta.status !== 201) {
                ElMessage.error('添加商品失败');
            } else {
                ElMessage.success('添加商品成功');
                router.push('/goods');
            }
        });
    })
};

onMounted(() => {
    getCateList();
});
</script>

<style scoped>
.el-steps {
    margin: 15px 0;
}

.el-checkbox {
    margin: 0 10px 10px 0 !important;
}

.preview-image {
    width: 100%;
}

.btn-add {
    margin-top: 15px;
}
</style>