<template>
    <div class="login">
        <h1>用户登录</h1>
        <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="ruleForm.username" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input type="password" v-model="ruleForm.password" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item   prop="mobileCode"
                            :rules="[
                            {required: true, message: '请输入验证码'},
                            {type:'number', message: '验证码必须为数字'}
                            ]">
                <el-col :span="12">
                    <el-input type="mobileCode" v-model.number="ruleForm.mobileCode" autocomplete="off"></el-input>
                </el-col>
                <el-col :span="12">
                    <el-button type="primary" :disabled="disabledSendCode" @click="sendCode">{{validCodeBtnText}}</el-button>
                </el-col>
            </el-form-item>
            <el-form-item size="large">
                <el-button style="width:100%" type="primary" @click="submitForm('ruleForm')">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { timer } from 'rxjs'
import { take } from 'rxjs/operators'

export default {
  data () {
    return {
      validCodeBtnText: '发送验证码',
      disabledSendCode: false,
      resetSecond: 120,
      ruleForm: {
        username: '',
        password: '',
        mobileCode: ''
      },
      rules: {
        username: [{required: true, message: '请输入用户名', trigger: 'blur'}],
        password: [{required: true, message: '请输入密码', trigger: 'blur'}],
        mobileCode: [{required: true, message: '请输入验证码', trigger: 'blur'}]
      }
    }
  },
  methods: {
    increment () {
      this.$store.commit('increment')
      console.log(this.$store.state.count)
    },
    sendCode () {
      if (this.disabledSendCode) {
        return false
      }
      this.$loginServ.sendValidCode(this.ruleForm.username).success((success) => {
        this.disabledSendCode = true
        this.resetSecond = 120
        this.validCodeBtnText = '重新发送'
        timer(0, 1000).pipe(take(120)).subscribe(value => {
          this.resetSecond -= 1
          this.validCodeBtnText = this.resetSecond + '秒后重试'
        },
        () => {},
        () => {
          this.validCodeBtnText = '发送验证码'
          this.disabledSendCode = false
        })
      })
    },
    submitForm (formName) {
      console.log(this.$refs[formName])
      this.$refs[formName].validate(valid => {
        console.log(valid)
        if (valid) {
          console.log(this.ruleForm)
          this.$loginServ.login(this.ruleForm).success((success) => {
            console.log(success)
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login{
    h1{
      font-family: SourceHanSansSC-Regular;
      font-size: 32px;
      line-height: 32px;
      color: #354754;
      font-weight: normal;
    }
    width: 400px;
    margin: auto;
}
</style>
