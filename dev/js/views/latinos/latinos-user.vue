<template>
    <div class="latinos-user">
        <activity-step :datas="datas" :showstep.sync="showstep"></activity-step>
        <div class="user-title">
            <h5><i>*</i>手机号</h5>
            <a>上传手机号Excel表</a>
            <upload
                    :src.sync="upCheck.upload_src"
                    :size="1048576"
                    :exts="['xlsx','xls']"
                    :url="'./upload/file'"></upload>
            <span>/</span>
            <a @click="downLoad">下载手机号Excel表</a>
        </div>
        <div class="table-row">
            <table class="table">
                <tr>
                    <th>手机号</th>
                    <th>手机号</th>
                    <th>手机号</th>
                    <th>手机号</th>
                    <th>手机号</th>
                </tr>
                <tr v-if="!!phoneList.length" v-for="n in phoneList">
                    <td v-for="m in n">
                        <!--<ks-checkbox v-if="!!m.phone" :checked.sync="m.ischeck">{{m.phone}}</ks-checkbox>-->
                        <span v-if="!!m.phone">{{m.phone}}</span>
                        <span v-if="!m.phone"></span>
                    </td>
                </tr>
                <tr v-if="!phoneList.length">
                    <td colspan="5">请下载手机模板填写上传</td>
                </tr>
            </table>
        </div>
        <div class="batch-upload">
            <div><label>*</label>短信内容</div>
            <div class="type-text">
                <textarea class="textarea" v-model="userData.messageContent" placeholder="请输入短信内容"></textarea>
            </div>
            <div><label class="batch-upload-label">*注：含标点符号56个汉字，签名必须前置，如【中国银行】尽享五折活动，单笔消费最高可优惠200元。可自定义</label></div>
        </div>
    </div>
    <div class="latinos-user-btn">
        <a class="btn btn-primary" @click="submit">确定</a>
    </div>
</template>
<style lang="scss">
    .latinos-user{
        .user-title{
            position: relative;
            margin: 10px 0;padding: 0 60px;
            overflow: hidden;
            h5{
                float: left;
                i{
                 color:red;
                }
            }
            a,span{
                float: right;
            }
            span{
                margin: 0 10px;
            }
            .upload{
                position: absolute;  right: 60px;  top: -10px;
                width: 110px;
                opacity: 0;  cursor: pointer;
            }
        }
        .table-row{
            padding: 0 60px; max-height: 500px;
            overflow: auto;
        }
        .batch-upload{
            margin: 10px 0;padding: 0 60px;
            label{
                color:red;
            }
            .batch-upload-label{
                cursor: text;
            }
            textarea{
                width: 100%;  height: 80px;  margin-top:10px;
            }
        }
    }
    .latinos-user-btn{
        margin:20px auto 0;
        text-align: center;
    }
</style>
<script>
import model from '../../ajax/latinos/latinos_user_model'
import activityStep from '../../components/activity-step.vue'
export default{
    data(){
        this.model=model(this);
        return{
            // datas:['生成宣传页','选择用户'],
            datas:['选择用户'],
            // showstep:1,
            showstep:0,
            id:'',
            upCheck:{
                upload_src:'',
                textarea:'',
            },
            userData:{
                messageContent:''
            },
            phoneList:[]
        }
    },
    events:{
        uploadSuccess(_id){
            let phoneList=[];
            this.model.batchNext({id:_id}).then((res)=>{
                if(res.data.code===0){
                    phoneList=res.data.data;
                    let data=[];
                    if(!phoneList.length)return;
                    _.map(phoneList,(val,index)=>{
                        data[index]={
                            phone:val,
                            ischeck:true
                        }
                    })
                    this.phoneList=_.chunk(data,5);
                    for(let i=0,j=5-_.size(_.last(this.phoneList));i<j;i++){
                        _.last(this.phoneList).push({phone:''});
                    }
                }
            })
        }
    },
    methods:{
        downLoad(){
            window.open(origin+'/user/rights/phone/download');
        },
        getMessage(){
            this.model.getMessage(this.id).then((res)=>{
                if(res.data.code===0){
                    this.userData.messageContent=res.data.data.messageContent;
                }
            })
        },
        submit(){
            if(!this.userData.messageContent){
                dialog('info','请输入短信内容！')
                return
            }
            if(!this.phoneList.length){
                dialog('info','请上传手机号码！')
                return
            }
            let phone=[];
            _.map(_.flattenDeep(this.phoneList),(n)=>{
                if(!!n.phone){
                    phone.push(n.phone)
                }
            })
            let data={
                userMobiles:phone,
                messageContent:this.userData.messageContent,
                favorID:this.id
            }
            console.log(phone);
            this.model.submitUser(data).then((res)=>{
                if(res.data.code===0){
                    dialog('successTime','已保存！')
                    setTimeout(()=>{
                        this.$router.go({name:'latinos-search'});
                    },2000)
                }
            })
        }
    },
    created(){
        (this.$route.params.latinosUserId!=":latinosUserId")?this.id=this.$route.params.latinosUserId:this.id='';
        this.getMessage();
    },
    components: { activityStep }
}
</script>