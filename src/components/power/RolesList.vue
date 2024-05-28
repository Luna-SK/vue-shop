<template>
  <div>
    <!-- breadcrumb navigation -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card view -->
    <el-card>
      <!-- add role button region -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- role list region -->
      <!-- set row-key='id' to prevent expanded region from auto closing -->
      <el-table :data="roleList" row-key="id" border stripe>
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-row
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, index1) in row.children"
              :key="item1.id"
            >
              <!-- L1 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(row, item1.id)" size="large">{{
                  item1.authName
                }}</el-tag>
                <el-icon>
                  <CaretRight />
                </el-icon>
              </el-col>
              <!-- L2 and L3 -->
              <el-col :span="19">
                <el-row
                  :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      size="large"
                      type="success"
                      closable
                      @close="removeRightById(row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      size="large"
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column width="300px" label="操作">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" size="small" @click="showEditDialog(row.id)"
              >编辑</el-button
            >
            <el-button type="danger" :icon="Delete" size="small" @click="removeRoleById(row.id)"
              >删除</el-button
            >
            <el-button type="warning" :icon="Setting" size="small" @click="showSetRightDialog(row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- dialog for adding role -->
    <el-dialog v-model="addDialogVisible" title="添加角色" width="50%" @close="addDialogClosed">
      <el-form
        ref="addFormRef"
        style="max-width: 600px"
        :model="addForm"
        :rules="addFormRules"
        label-width="auto"
        status-icon
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole"> 确 定 </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- dialog for editing role -->
    <el-dialog v-model="editDialogVisible" title="修改角色" width="50%" @close="editDialogClosed">
      <el-form
        ref="editFormRef"
        style="max-width: 600px"
        :model="editForm"
        :rules="editFormRules"
        label-width="auto"
        status-icon
      >
        <el-form-item label="角色 ID">
          <el-input v-model="editForm.roleId" disabled />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoleInfo"> 确 定 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- dialog for assigning role right -->
    <el-dialog
      v-model="setRightDialogVisible"
      title="分配权限"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        style="max-width: 600px"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defKeys"
        ref="treeRef"
      />
      <template #footer>
        <div>
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allocateRights"> 确 定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Edit, Delete, Setting } from '@element-plus/icons-vue'
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox, ElTree } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const roleList = ref([])

const getRoleList = () => {
  axios.get('/roles').then(({ data: res }) => {
    if (res.meta.status !== 200) {
      return ElMessage.error('获取角色列表失败！')
    }
    roleList.value = res.data
  })
}

const addDialogVisible = ref(false)

const addForm = reactive({
  roleName: '',
  roleDesc: ''
})

interface RuleAddForm {
  roleName: string
}

const addFormRules = reactive<FormRules<RuleAddForm>>({
  roleName: [
    {
      required: true,
      message: '请输入角色名称',
      trigger: 'blur'
    }
  ]
})

const addFormRef = ref<FormInstance>()

const addDialogClosed = () => {
  addFormRef.value?.resetFields()
}

// click button to add role
const addRole = () => {
  addFormRef.value?.validate((valid) => {
    if (!valid) {
      return
    }
    // submit the added role information
    axios.post('/roles', addForm).then(({ data: res }) => {
      if (res.meta.status !== 201) {
        return ElMessage.error('创建角色失败！')
      }
      addDialogVisible.value = false
      getRoleList()
      ElMessage.success('创建角色成功！')
    })
  })
}

const editForm: any = ref({})

interface RuleEditForm {
  roleName: string
}

const editFormRules = reactive<FormRules<RuleEditForm>>({
  roleName: [
    {
      required: true,
      message: '请输入角色名称',
      trigger: 'blur'
    }
  ]
})

const editFormRef = ref<FormInstance>()

const editDialogVisible = ref(false)

const showEditDialog = (id: number) => {
  axios.get(`/roles/${id}`).then(({ data: res }) => {
    if (res.meta.status !== 200) {
      return ElMessage.error('获取角色信息失败！')
    }
    editForm.value = res.data
    editDialogVisible.value = true
  })
}

const editDialogClosed = () => {
  editFormRef.value?.resetFields()
}

const editRoleInfo = () => {
  editFormRef.value?.validate((valid) => {
    if (!valid) {
      return
    }
    // submit the edited role information
    axios
      .put(`/roles/${editForm.value.roleId}`, {
        roleName: editForm.value.roleName,
        roleDesc: editForm.value.roleDesc
      })
      .then(({ data: res }) => {
        if (res.meta.status !== 200) {
          return ElMessage.error('修改角色信息失败！')
        }
        editDialogVisible.value = false
        getRoleList()
        ElMessage.success('修改角色信息成功！')
      })
  })
}

const removeRoleById = (id: number) => {
  ElMessageBox.confirm('此操作将永久删除该角色, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      axios.delete(`/roles/${id}`).then(({ data: res }) => {
        if (res.meta.status !== 200) {
          return ElMessage.error('删除角色失败！')
        }
        ElMessage.success('删除角色成功！')
        getRoleList()
      })
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

const removeRightById = (role: any, rightId: number) => {
  ElMessageBox.confirm('此操作将永久删除该权限，是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      axios.delete(`/roles/${role.id}/rights/${rightId}`).then(({ data: res }) => {
        if (res.meta.status !== 200) {
          return ElMessage.error('删除权限失败！')
        }
        role.children = res.data
      })
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

interface Tree {
  label: string
  children?: Tree[]
}

const rightsList = ref<Tree[]>([])

const treeProps = {
  label: 'authName',
  children: 'children'
}

// default expanded keys
const defKeys = reactive<number[]>([])

// role id which is being assigned
const roleId = ref(0)

// get all L3 leaf node key's id and push them into defKeys
const getLeafKeys = (node: any, arr: any) => {
  if (!node.children) {
    arr.push(node.id)
  } else {
    node.children.forEach((item: any) => {
      getLeafKeys(item, arr)
    })
  }
}

const setRightDialogVisible = ref(false)

const showSetRightDialog = (role: any) => {
  roleId.value = role.id
  axios.get('/rights/tree').then(({ data: res }) => {
    if (res.meta.status !== 200) {
      return ElMessage.error('获取权限列表失败！')
    }
    rightsList.value = res.data
    // get all L3's id using recursive function
    getLeafKeys(role, defKeys)
    setRightDialogVisible.value = true
  })
}

// monitor the closing event of the dialog
const setRightDialogClosed = () => {
  defKeys.splice(0)
}

const treeRef = ref<InstanceType<typeof ElTree>>()

const allocateRights = () => {
  defKeys.push(...(treeRef.value?.getCheckedKeys() as number[]))
  defKeys.push(...(treeRef.value?.getHalfCheckedKeys() as number[]))
  axios
    .post(`/roles/${roleId.value}/rights`, {
      rids: defKeys.join(',')
    })
    .then(({ data: res }) => {
      if (res.meta.status !== 200) {
        return ElMessage.error('分配权限失败！')
      }
      setRightDialogVisible.value = false
      getRoleList()
      ElMessage.success('分配权限成功！')
    })
}

onMounted(() => {
  getRoleList()
})
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
