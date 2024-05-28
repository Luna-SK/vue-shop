<template>
  <div>
    <el-config-provider :locale="zhCn">
      <!-- breadcrumb navigation -->
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
        <el-breadcrumb-item>数据报表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <div id="main" style="width: 750px; height: 400px"></div>
      </el-card>
    </el-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as echarts from 'echarts'
import { onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import _ from 'lodash'

onMounted(() => {
  const myChart = echarts.init(document.getElementById('main'))

  // data needed to merge
  const options = {
    title: {
      text: '用户来源'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#E9EEF3'
        }
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        boundaryGap: false
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ]
  }

  axios.get('reports/type/1').then(({ data: res }) => {
    if (res.meta.status !== 200) {
      return ElMessage.error('获取数据失败')
    }

    const result = _.merge(options, res.data)

    myChart.setOption(result)
  })
})
</script>

<style lang="less" scoped></style>
