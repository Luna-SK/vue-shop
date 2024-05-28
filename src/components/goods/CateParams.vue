<template>
  <div>
    <!-- breadcrumb navigation region -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card view region -->
    <el-card>
      <!-- alert region -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      />
      <!-- choosing goods categories region -->
      <el-row>
        <el-col class="cat-opt">
          <span>选择商品分类：</span>
          <!-- cascader for choosing goods category -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleCateChange"
            clearable
          />
        </el-col>
      </el-row>
      <!-- tabs region -->
      <el-tabs type="border-card" v-model="activeName" @tab-change="handleTabClick">
        <!-- panel to add dynamic parameters -->
        <el-tab-pane label="动态参数" name="many">
          <!-- button to add parameters -->
          <el-button
            type="primary"
            size="large"
            :disabled="isBtnDisbaled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- dynamic parameters table -->
          <el-table :data="manyTableData" row-key="attr_id" order stripe>
            <!-- expand row -->
            <el-table-column type="expand">
              <template #default="{ row }">
                <el-tag
                  v-for="(item, index) in row.attr_vals"
                  :key="index"
                  type="primary"
                  size="large"
                  closable
                  @close="handleClose(index, row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="row.inputVisible"
                  ref="InputRef"
                  v-model="row.inputValue"
                  @keyup.enter="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"
                />
                <el-button v-else class="button-new-tag" @click="showInput(row)">
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- index row -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button type="primary" :icon="Edit" @click="showEditDialog(row.attr_id)"
                  >编辑</el-button
                >
                <el-button type="danger" :icon="Delete" @click="removeParams(row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- panel to add static attributes -->
        <el-tab-pane label="静态属性" name="only">
          <!-- button to add attributes -->
          <el-button
            type="primary"
            size="large"
            :disabled="isBtnDisbaled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- static attributes table -->
          <el-table :data="onlyTableData" row-key="attr_id" border stripe>
            <!-- expand row -->
            <el-table-column type="expand">
              <template #default="{ row }">
                <el-tag
                  v-for="(item, index) in row.attr_vals"
                  :key="index"
                  type="primary"
                  size="large"
                  closable
                  @close="handleClose(index, row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="row.inputVisible"
                  ref="InputRef"
                  v-model="row.inputValue"
                  @keyup.enter="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"
                />
                <el-button v-else class="button-new-tag" @click="showInput(row)">
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- index row -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button type="primary" :icon="Edit" @click="showEditDialog(row.attr_id)"
                  >编辑</el-button
                >
                <el-button type="danger" :icon="Delete" @click="removeParams(row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- dialog for adding dynamic parameters or static attributes -->
    <el-dialog
      v-model="addDialogVisible"
      :title="'添加' + titleText"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        ref="addFormRef"
        style="max-width: 600px"
        :model="addForm"
        :rules="addFormRules"
        label-width="auto"
        status-icon
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams"> 确 定 </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="editDialogVisible"
      :title="'修改' + titleText"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        ref="editFormRef"
        style="max-width: 600px"
        :model="editForm"
        :rules="editFormRules"
        label-width="auto"
        status-icon
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams"> 确 定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Edit, Delete } from '@element-plus/icons-vue'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ElInput, FormInstance, FormRules } from 'element-plus'

// goods category list
const cateList = ref([])

// table data for dynamic parameters
const manyTableData = ref([])

// table data for static attributes
const onlyTableData = ref([])

// get goods category list
const getCateList = () => {
  axios.get('categories').then(({ data: res }) => {
    if (res.meta.status !== 200) {
      return ElMessage.error('获取商品分类列表失败！')
    }
    cateList.value = res.data
  })
}

// specify cascader props object
const cateProps = {
  expandTrigger: 'hover' as const,
  value: 'cat_id',
  label: 'cat_name',
  children: 'children'
}

// array of selected category keys
const selectedCateKeys = ref([])

const activeName = ref('many')

// whether the button is disabled
const isBtnDisbaled = computed(() => {
  if (selectedCateKeys.value) {
    return selectedCateKeys.value.length !== 3
  }
  return true
})

const cateId = computed(() => {
  if (selectedCateKeys.value) {
    return selectedCateKeys.value[selectedCateKeys.value.length - 1]
  }
  return null
})

const getParamsData = () => {
  if (selectedCateKeys.value.length !== 3) {
    selectedCateKeys.value = []
    onlyTableData.value = []
    manyTableData.value = []
    return
  }
  axios
    .get(`categories/${cateId.value}/attributes`, {
      params: {
        sel: activeName.value
      }
    })
    .then(({ data: res }) => {
      if (res.meta.status !== 200 && !isBtnDisbaled.value) {
        return ElMessage.error('获取参数列表失败！')
      }
      console.log(res.data)
      res.data.forEach((item: any) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // control textarea visibility
        item.inputVisible = false
        // input content
        item.inputValue = ''
      })
      if (activeName.value === 'many') {
        manyTableData.value = res.data
      } else {
        onlyTableData.value = res.data
      }
    })
}

// triggered when cascader selection changes
const handleCateChange = () => {
  getParamsData()
}

const handleTabClick = () => {
  getParamsData()
}

const titleText = computed(() => {
  return activeName.value === 'many' ? '动态参数' : '静态属性'
})

// control add dialog visibility
const addDialogVisible = ref(false)

interface AddForm {
  attr_name: string
}

// form data for adding
const addForm: AddForm = reactive({
  attr_name: ''
})

const addFormRef = ref<FormInstance>()

const addFormRules = reactive<FormRules<AddForm>>({
  attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
})

const addDialogClosed = () => {
  addFormRef.value?.resetFields()
}

// click button to add parameters
const addParams = () => {
  addFormRef.value?.validate((valid) => {
    if (!valid) {
      return
    }
    axios
      .post(`categories/${cateId.value}/attributes`, {
        attr_name: addForm.attr_name,
        attr_sel: activeName.value
      })
      .then(({ data: res }) => {
        if (res.meta.status !== 201) {
          return ElMessage.error('添加参数失败！')
        }
        ElMessage.success('添加参数成功！')
        addDialogVisible.value = false
        getParamsData()
      })
  })
}

interface EditForm {
  attr_name: string
}

const editForm = ref<any>({})

const editFormRules = reactive<FormRules<EditForm>>({
  attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
})

const editFormRef = ref<FormInstance>()

const editDialogVisible = ref(false)

const editDialogClosed = () => {
  editFormRef.value?.resetFields()
}

// click button to show edit dialog
const showEditDialog = (id: number) => {
  axios
    .get(`categories/${cateId.value}/attributes/${id}`, {
      params: {
        attr_sel: activeName.value
      }
    })
    .then(({ data: res }) => {
      if (res.meta.status !== 200) {
        return ElMessage.error('获取参数失败！')
      }
      editForm.value = res.data
      editDialogVisible.value = true
    })
}

// click button to edit parameters
const editParams = () => {
  editFormRef.value?.validate((valid) => {
    if (!valid) {
      return
    }
    axios
      .put(`categories/${cateId.value}/attributes/${editForm.value.attr_id}`, {
        attr_name: editForm.value.attr_name,
        attr_sel: activeName.value
      })
      .then(({ data: res }) => {
        if (res.meta.status !== 200) {
          return ElMessage.error('修改参数失败！')
        }
        ElMessage.success('修改参数成功！')
        getParamsData()
        editDialogVisible.value = false
      })
  })
}

const removeParams = (id: number) => {
  ElMessageBox.confirm('此操作将永久删除该参数，是否继续？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      axios.delete(`categories/${cateId.value}/attributes/${id}`).then(({ data: res }) => {
        if (res.meta.status !== 200) {
          return ElMessage.error('删除失败！')
        }
        ElMessage.success('删除成功！')
        getParamsData()
      })
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

const InputRef = ref<InstanceType<typeof ElInput>>()

// save the modified attr_vals to database
const saveAttrVals = (row: any) => {
  axios
    .put(`categories/${cateId.value}/attributes/${row.attr_id}`, {
      attr_name: row.attr_name,
      attr_sel: row.attr_sel,
      attr_vals: row.attr_vals.join(' ')
    })
    .then(({ data: res }) => {
      if (res.meta.status !== 200) {
        return ElMessage.error('修改参数项失败！')
      }
      ElMessage.success('修改参数项成功！')
    })
}

// when click enter or blur, confirm the input content
const handleInputConfirm = (row: any) => {
  if (row.inputValue.trim().length === 0) {
    row.inputValue = ''
    row.inputVisible = false
    return
  }
  // need to add the new tag
  row.attr_vals.push(row.inputValue.trim())
  row.inputValue = ''
  row.inputVisible = false
  saveAttrVals(row)
}

const showInput = (row: any) => {
  row.inputVisible = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

// delete related parameter item
const handleClose = (index: number, row: any) => {
  row.attr_vals.splice(index, 1)
  saveAttrVals(row)
}

onMounted(() => {
  getCateList()
})
</script>

<style lang="less" scoped>
.cat-opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
