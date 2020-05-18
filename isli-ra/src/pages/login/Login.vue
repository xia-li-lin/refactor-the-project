<template>
    <div class="login">
        <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
            <el-form-item label="用户名" prop="userName">
                <el-input v-model="ruleForm.userName" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input type="password" v-model="ruleForm.password" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item   prop="code"
                            :rules="[
                            {required:true,message:'请输入验证码'},
                            {type:'number',message:'验证码必须为数字'}
                            ]">
                <el-col :span="12">
                    <el-input type="code" v-model.number="ruleForm.code" autocomplete="off"></el-input>
                </el-col>
                <el-col :span="12">
                    <el-button type="primary" @click="sendCode">发送验证码</el-button>
                </el-col>
            </el-form-item>
            <el-form-item size="large">
                <el-button style="width:100%" type="primary" @click="submitForm('ruleForm')">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
  data () {
    const validateUserName = (rule, value, callback) => {
      console.log(rule)
      if (!value) {
        return callback(new Error('请输入用户名'))
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入密码'))
      }
    }
    const validateCode = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入验证码'))
      }
    }
    return {
      ruleForm: {
        userName: '',
        password: '',
        code: ''
      },
      rules: {
        userName: [{validator: validateUserName, trigger: 'blur'}],
        password: [{validator: validatePassword, trigger: 'blur'}],
        code: [{validator: validateCode, trigger: 'blur'}]
      }
    }
  },
  methods: {
    sendCode () {
      console.log(this.ruleForm.code)
    },
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {}
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login{
    width: 400px;
    margin: auto;
}
</style>
