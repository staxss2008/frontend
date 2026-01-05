<template>
  <div class="application-create">
    <el-card>
      <template #header>
        <h3>创建用车申请</h3>
      </template>

      <el-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="120px"
      >
        <el-form-item label="用车类型" prop="tripType">
          <el-select v-model="form.tripType" placeholder="请选择用车类型">
            <el-option label="公务用车" value="OFFICIAL" />
            <el-option label="通勤用车" value="TRANSPORT" />
            <el-option label="接待用车" value="RECEIVE" />
          </el-select>
        </el-form-item>

        <el-form-item label="用车事由" prop="purpose">
          <el-input 
            v-model="form.purpose" 
            type="textarea" 
            :rows="3"
            placeholder="请输入用车事由"
          />
        </el-form-item>

        <el-form-item label="乘车人数" prop="passengerCount">
          <el-input-number 
            v-model="form.passengerCount" 
            :min="1" 
            :max="50"
          />
        </el-form-item>

        <el-form-item label="计划开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="计划结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="出发地点" prop="startLocation">
          <el-input v-model="form.startLocation" placeholder="请输入出发地点" />
        </el-form-item>

        <el-form-item label="目的地" prop="endLocation">
          <el-input v-model="form.endLocation" placeholder="请输入目的地" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">提交申请</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { createApplication } from '@/api/application'

const router = useRouter()
const formRef = ref(null)

// 表单数据
const form = ref({
  tripType: '',
  purpose: '',
  passengerCount: 1,
  startTime: '',
  endTime: '',
  startLocation: '',
  endLocation: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  tripType: [
    { required: true, message: '请选择用车类型', trigger: 'change' }
  ],
  purpose: [
    { required: true, message: '请输入用车事由', trigger: 'blur' }
  ],
  passengerCount: [
    { required: true, message: '请输入乘车人数', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择计划开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择计划结束时间', trigger: 'change' }
  ],
  startLocation: [
    { required: true, message: '请输入出发地点', trigger: 'blur' }
  ],
  endLocation: [
    { required: true, message: '请输入目的地', trigger: 'blur' }
  ]
}

// 提交表单
const submitForm = async () => {
  await formRef.value.validate(valid => {
    if (valid) {
      // 验证结束时间是否大于开始时间
      if (new Date(form.value.endTime) <= new Date(form.value.startTime)) {
        ElMessage.error('结束时间必须大于开始时间')
        return
      }

      createApplication(form.value).then(() => {
        ElMessage.success('申请提交成功')
        router.push('/application/list')
      }).catch(error => {
        ElMessage.error(error.message || '申请提交失败')
      })
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.application-create {
  padding: 1.5rem;
}

.el-card {
  max-width: 800px;
  margin: 0 auto;
}
</style>