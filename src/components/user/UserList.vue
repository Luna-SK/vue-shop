<template>
    <div>
        <!-- breadcrumb navigation region -->
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- card view region -->
        <el-card>
            <!-- search and add region -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <template #append>
                            <el-button :icon="Search" @click="getUserList" />
                        </template>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- user list region -->
            <el-table :data="userList" border stripe>
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column label="姓名" prop="username">
                </el-table-column>
                <el-table-column label="邮箱" prop="email">
                </el-table-column>
                <el-table-column label="电话" prop="mobile">
                </el-table-column>
                <el-table-column label="角色" prop="role_name">
                </el-table-column>
                <el-table-column label="状态">
                    <template #default="{ row }">
                        <el-switch v-model="row.mg_state" @change="userStateChanged(row)" />
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="{ row }">
                        <!-- modify button -->
                        <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
                            <el-button type="primary" :icon="Edit" @click="showEditDialog(row.id)" />
                        </el-tooltip>
                        <!-- delete button -->
                        <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" :icon="Delete" @click="removeUserById(row.id)" />
                        </el-tooltip>
                        <!-- assign role button -->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" :icon="Setting" />
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- pagination region -->
            <el-pagination v-model:current-page="queryInfo.pagenum" v-model:page-size="queryInfo.pagesize"
                :page-sizes="[1, 2, 5, 10]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </el-card>
        <!-- dialog for adding user -->
        <el-dialog v-model="addDialogVisible" title="添加用户" width="50%" @close="addDialogClosed">
            <el-form ref="addFormRef" style="max-width: 600px" :model="addForm" :rules="addFormRules" label-width="auto"
                status-icon>
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email" />
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addUser">
                        确 定
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <!-- dialog for editing user -->
        <el-dialog v-model="editDialogVisible" title="修改用户" width="50%" @close="editDialogClosed">
            <el-form ref="editFormRef" style="max-width: 600px" :model="editForm" :rules="editFormRules"
                label-width="auto" status-icon>
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email" />
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editUserInfo">
                        确 定
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ArrowRight, Search, Edit, Delete, Setting } from '@element-plus/icons-vue';
import { onMounted, ref, reactive } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

const queryInfo = reactive({
    query: '',
    pagenum: 1,
    pagesize: 2
});

const userList = ref([]);
const total = ref(0);

const getUserList = () => {
    axios.get('users', {
        params: queryInfo
    }).then(({ data: res }) => {
        if (res.meta.status !== 200) {
            return ElMessage.error('获取用户列表失败');
        }
        userList.value = res.data.users;
        total.value = res.data.total;
    });

};

const handleSizeChange = (newSize: number) => {
    queryInfo.pagesize = newSize;
    getUserList();
};

const handleCurrentChange = (newPage: number) => {
    queryInfo.pagenum = newPage;
    getUserList();
};

const userStateChanged = async (userInfo: any) => {
    const { data: res } = await axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
    if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state;
        return ElMessage.error('更新用户状态失败！');
    }
    ElMessage.success('更新用户状态成功！');
};

const addDialogVisible = ref(false);

const addForm: any = reactive({
    username: '',
    password: '',
    email: '',
    mobile: ''
});

// validate email
const checkEmail = (rule: any, value: any, callback: any) => {
    // regular expression for validating email
    const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
    if (regEmail.test(value)) {
        callback();
    } else {
        callback(new Error('请输入合法的邮箱'));
    }
};

// validate phone number
const checkMobile = (rule: any, value: any, callback: any) => {
    // regular expression for validating phone number
    const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]14[57])[0-9]{8}$/;
    if (regMobile.test(value)) {
        callback();
    } else {
        callback(new Error('请输入合法的手机号'));
    }
};

interface RuleAddForm {
    username: string;
    password: string;
    email: string;
    mobile: string;
}

const addFormRules = reactive<FormRules<RuleAddForm>>({
    username: [
        {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
        },
        {
            min: 3,
            max: 10,
            message: '用户名的长度在3～10个字符之间',
            trigger: 'blur'
        }
    ],
    password: [
        {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
        },
        {
            min: 6,
            max: 15,
            message: '用户名的长度在6～15个字符之间',
            trigger: 'blur'
        }
    ],
    email: [
        {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
        },
        {
            validator: checkEmail,
            trigger: 'blur'
        }
    ],
    mobile: [
        {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
        },
        {
            validator: checkMobile,
            trigger: 'blur'
        }
    ]
});

const addFormRef = ref<FormInstance>();

// monitor the closing event of the dialog
const addDialogClosed = () => {
    addFormRef.value?.resetFields();
};

// click button to add user
const addUser = () => {
    addFormRef.value?.validate((valid) => {
        if (!valid) {
            return;
        }
        axios.post('users', addForm).then(({ data: res }) => {
            if (res.meta.status !== 201) {
                return ElMessage.error('添加用户失败');
            }
            ElMessage.success('添加用户成功');
            addDialogVisible.value = false;
            getUserList();
        });
    });
};

const editForm: any = ref({});

// control the visibility of the dialog for editing user
const editDialogVisible = ref(false);

// click button to show the dialog for editing user
const showEditDialog = (id: number) => {
    axios.get(`users/${id}`).then(({ data: res }) => {
        if (res.meta.status !== 200) {
            return ElMessage.error('获取用户信息失败');
        }
        editForm.value = res.data;
    });
    editDialogVisible.value = true;
};

interface RuleEditForm {
    email: string;
    mobile: string;
}

const editFormRules = reactive<FormRules<RuleEditForm>>({
    email: [
        {
            required: true,
            message: '请输入用户邮箱',
            trigger: 'blur'
        },
        {
            validator: checkEmail,
            trigger: 'blur'
        }
    ],
    mobile: [
        {
            required: true,
            message: '请输入用户手机号',
            trigger: 'blur'
        },
        {
            validator: checkMobile,
            trigger: 'blur'
        }
    ]
});

const editFormRef = ref<FormInstance>();

// monitor the closing event of the dialog
const editDialogClosed = () => {
    editFormRef.value?.resetFields();
};

// edit user information and submit
const editUserInfo = () => {
    editFormRef.value?.validate((valid) => {
        if (!valid) {
            return;
        }
        // submit the edited user information
        axios.put(`users/${editForm.value.id}`, {
            email: editForm.value.email,
            mobile: editForm.value.mobile
        })
            .then(({ data: res }) => {
                if (res.meta.status !== 200) {
                    return ElMessage.error('更新用户信息失败');
                }
                // close the dialog
                editDialogVisible.value = false;
                // refresh the user list
                getUserList();
                // prompt the success message
                ElMessage.success('更新用户信息成功');
            });
    });
};

const open = () => {
    ElMessageBox.confirm(
        'proxy will permanently delete the file. Continue?',
        'Warning',
        {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    )
        .then(() => {
            ElMessage({
                type: 'success',
                message: 'Delete completed',
            });
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: 'Delete canceled',
            });
        });
};

// remove user information by id
const removeUserById = (id: number) => {
    ElMessageBox.confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            axios.delete(`users/${id}`).then(({ data: res }) => {
                if (res.meta.status !== 200) {
                    return ElMessage.error('删除用户失败');
                }
            })
            ElMessage({
                type: 'success',
                message: '删除用户成功',
            });
            getUserList();
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '已取消删除',
            });
        });
};

onMounted(() => {
    getUserList();
});
</script>

<style lang="less" scoped></style>