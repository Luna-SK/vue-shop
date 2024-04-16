<template>
    <div>
        <!-- breadcrumb navigation region -->
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- card region -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- table region -->
            <vxe-table border class="treeTable" :data="cateList" :tree-config="{ childrenField: 'children' }"
                :edit-config="{ trigger: 'click', mode: 'row' }" :checkbox-config="{ labelField: 'id' }">
                <vxe-column type="seq" width="150px" title="#" tree-node></vxe-column>
                <vxe-column field="cat_name" title="分类名称"></vxe-column>
                <vxe-column field="cat_deleted" title="是否有效">
                    <template #default="{ row }">
                        <el-icon size="large" v-if="row.cat_deleted === false" style="color: lightgreen">
                            <CircleCheck />
                        </el-icon>
                        <el-icon size="large" v-else style="color: red">
                            <CircleClose />
                        </el-icon>
                    </template>
                </vxe-column>
                <vxe-column field="cat_level" title="排序">
                    <template v-slot="{ row }">
                        <el-tag size="large" v-if="row.cat_level === 0">一级</el-tag>
                        <el-tag size="large" v-else-if="row.cat_level === 1" type="success">二级</el-tag>
                        <el-tag size="large" v-else type="warning">三级</el-tag>
                    </template>
                </vxe-column>
                <vxe-column title="操作">
                    <template #default="{ row }">
                        <el-button type="primary" size="large" :icon="Edit"
                            @click="showEditCateDialog(row.cat_id)">编辑</el-button>
                        <el-button type="danger" size="large" :icon="Delete"
                            @click="removeCateById(row.cat_id)">删除</el-button>
                    </template>
                </vxe-column>
            </vxe-table>
            <!-- pagination region -->
            <vxe-pager align="left" size="small" background :page-sizes="[3, 5, 10, 15]"
                v-model:page-size="queryInfo.pagesize" v-model:current-page="queryInfo.pagenum" :total="total"
                :layouts="['Total', 'Sizes', 'PrevJump', 'PrevPage', 'JumpNumber', 'NextPage', 'NextJump', 'FullJump']"
                @page-change="handlePageChange">
            </vxe-pager>
        </el-card>
        <!-- dialog to add categories -->
        <el-dialog v-model="addCateDialogVisible" title="添加分类" width="50%" @close="addCateDialogClosed">
            <el-form ref="addCateFormRef" style="max-width: 600px" :model="addCateForm" :rules="addCateFormRules"
                label-width="auto" status-icon>
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name" />
                </el-form-item>
                <el-form-item label="父级分类：">
                    <!-- options: data source -->
                    <!-- props: config object -->
                    <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps"
                        @change="parentCateChange" clearable style="width: 100%;" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="addCateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addCate">
                        确 定
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <!-- dialog to edit categories -->
        <el-dialog v-model="editCateDialogVisible" title="修改分类" width="50%" @close="editCateDialogClosed">
            <el-form ref="editCateFormRef" style="max-width: 600px" :model="editCateForm" :rules="editCateFormRules"
                label-width="auto" status-icon>
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="editCateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editCate">
                        确 定
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ArrowRight, Edit, Delete } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';

const cateList = ref([]);

interface QueryInfo {
    type?: 1 | 2 | 3;
    pagenum?: number;
    pagesize?: number;
}

const queryInfo = reactive<QueryInfo>({
    type: 3,
    pagenum: 1,
    pagesize: 5,
});

const getCateList = () => {
    axios.get('categories', {
        params: {
            type: queryInfo.type,
            pagenum: queryInfo.pagenum,
            pagesize: queryInfo.pagesize
        }
    }).then(({ data: res }) => {
        if (res.meta.status !== 200) {
            return ElMessage.error('获取商品分类列表失败');
        }
        cateList.value = res.data.result;
        total.value = res.data.total;
    });
};

const total = ref(0);

interface Page {
    currentPage: number;
    pageSize: number;
}

// monitor the page change event
const handlePageChange = (page: Page) => {
    queryInfo.pagesize = page.pageSize;
    queryInfo.pagenum = page.currentPage;
    getCateList();
};

// control the dialog visibility for adding categories
const addCateDialogVisible = ref(false);

// click button to show the dialog for adding categories
const showAddCateDialog = () => {
    // get the parent category list at first
    getParentCateList();
    // display the dialog
    addCateDialogVisible.value = true;
};

interface AddCateRuleForm {
    cat_pid: number;
    cat_name: string;
    cat_level: number;
}

// add category form
const addCateForm = reactive<AddCateRuleForm>({
    // category name to be added
    cat_name: '',
    // parent category id
    cat_pid: 0,
    // category level
    cat_level: 0
});

const addCateFormRules = reactive<FormRules<AddCateRuleForm>>({
    cat_name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' }
    ]
});

// parent category list
const parentCateList = ref([]);

// get the parent category list
const getParentCateList = () => {
    axios.get('categories', {
        params: { type: 2 }
    }).then(({ data: res }) => {
        if (res.meta.status !== 200) {
            return ElMessage.error('获取父级分类列表失败');
        }
        parentCateList.value = res.data;
    });
};

// specify cascader props object
const cascaderProps = {
    expandTrigger: 'hover' as const,
    checkStrictly: true,
    value: 'cat_id',
    label: 'cat_name',
    children: 'children'
};

// array of selected parent category's id
const selectedKeys = ref([]);

// trigger when selected item changes
const parentCateChange = () => {
    console.log(selectedKeys.value);
    // len(selectedKeys) !== 0: select parent category
    // len(selectedKeys) === 0: select root category
    if (selectedKeys.value.length > 0) {
        addCateForm.cat_pid = selectedKeys.value[selectedKeys.value.length - 1];
        addCateForm.cat_level = selectedKeys.value.length;
    } else {
        addCateForm.cat_pid = 0;
        addCateForm.cat_level = 0;
    }
};

const addCateFormRef = ref<FormInstance>();

const addCate = () => {
    addCateFormRef.value?.validate((valid) => {
        if (!valid) {
            return;
        }
        axios.post('categories', addCateForm)
            .then(({ data: res }) => {
                if (res.meta.status !== 201) {
                    return ElMessage.error('添加分类失败');
                }
                ElMessage.success('添加分类成功');
                getCateList();
                addCateDialogVisible.value = false;
            });
    });
};

// monitor the dialog closing event
const addCateDialogClosed = () => {
    addCateFormRef.value?.resetFields();
    selectedKeys.value = [];
    addCateForm.cat_pid = 0;
    addCateForm.cat_level = 0;
};

const editCateDialogVisible = ref(false);


interface EditCateRuleForm {
    cat_name: string;
}

const editCateForm = reactive<EditCateRuleForm>({
    cat_name: ''
});

const editCateFormRules = reactive<FormRules<EditCateRuleForm>>({
    cat_name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' }
    ]
});

const editCateFormRef = ref<FormInstance>();

const editCateDialogClosed = () => {
    editCateFormRef.value?.resetFields();
};

const editCateId = ref(0);

const showEditCateDialog = (id: number) => {
    console.log(id);
    editCateDialogVisible.value = true;
    editCateId.value = id;
    axios.get(`categories/${id}`)
        .then(({ data: res }) => {
            if (res.meta.status !== 200) {
                return ElMessage.error('获取分类信息失败');
            }
            console.log(res.data);
            editCateForm.cat_name = res.data.cat_name;
        });
};

const editCate = () => {
    editCateFormRef.value?.validate((valid) => {
        if (!valid) {
            return;
        }
        axios.put(`categories/${editCateId.value}`, {
            cat_name: editCateForm.cat_name
        }).then(({ data: res }) => {
            if (res.meta.status !== 200) {
                return ElMessage.error('修改分类失败');
            }
            ElMessage.success('修改分类成功');
            getCateList();
            editCateDialogVisible.value = false;
        });
    });
};

const removeCateById = (id: number) => {
    ElMessageBox.confirm(
        '此操作将永久删除该分类，是否继续?',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        axios.delete(`categories/${id}`)
            .then(({ data: res }) => {
                if (res.meta.status !== 200) {
                    return ElMessage.error('删除分类失败！');
                }
                ElMessage.success('删除分类成功');
                getCateList();
            });
    }).catch(() => {
        ElMessage.info('已取消删除');
    });
};

onMounted(() => {
    getCateList();
});
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
    margin-bottom: 15px;
}
</style>