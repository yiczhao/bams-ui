<template>
<activity-main :propclass="'bussiness-set'" :showstep.sync="showstep">
    <div class="rule-row rule-title">
        <a class="btn btn-primary" @click="addBtn">添加商户</a>
        <div class="search-div">
            <input class="input" type="text" v-model="storeName" placeholder="输入商户名称/商户ID筛选"/>
        </div>
    </div>
    <div class="table-row">
        <table class="table">
            <tr>
                <th>商户ID</th>
                <th>商户名称</th>
                <th>票务名称</th>
                <th>操作</th>
            </tr>
            <tr v-show="!!searchList" v-for="n in searchList | filterBy storeName in 'id' 'name'|orderBy 'id'" track-by="$index">
                <td>{{n.id}}</td>
                <td>{{n.name}}</td>
                <td>{{n.ticketName}}</td>
                <td class="txt-right"><a @click="searchList.splice($index,1)">移除</a></td>
            </tr>
            <tr v-show="!searchList.length">
                <td colspan="4">
                    请添加商户
                </td>
            </tr>
        </table>
    </div>
    <div class="rule-row tc footer-btns">
        <a class="btn btn-gray" @click="backBasic">上一步</a>
        <a class="btn btn-primary" @click="submitAdd(true)">保存并提交审核</a>
        <a @click="submitAdd(false)">保存为草稿</a>
    </div>
    <content-dialog
            :show.sync="addshow" :is-button="false" :type.sync="'infos'"
            :title.sync="'添加商户'"
    >
        <div class="add-table">
            <div class="add-search">
                <span>商户名称</span>
                <input class="input" type="text" v-model="addsearchData.name" @keyup.enter="dosearch"/>
                <a class="btn btn-primary" @click="dosearch">搜索</a>
            </div>
            <div class="add-search">
                <ks-checkbox v-for="n in ticketData" :checked.sync="n.ischeck">{{n.ticketName}}</ks-checkbox>
            </div>
            <div class="addtable-row">
                <table class="table">
                    <tr>
                        <th>
                            <div v-show="!!addList">
                                <div class="KSNRCheckbox KSNRCheckbox__UID--all">
                                    <input id="all" type="checkbox" @change="chooseAll" v-model="checkAll"/>
                                    <label class="KSNRCheckbox__skin" for="all"></label>
                                </div>
                                <!--<ks-checkbox @change="chooseAll" :checked.sync="checkAll"></ks-checkbox>-->
                            </div>
                        </th>
                        <th>商户ID</th>
                        <th>商户名称</th>
                    </tr>
                    <tr v-show="!!addList" v-for="n in addList">
                        <td><ks-checkbox :checked.sync="n.ischeck" @change="checkeds(n)"></ks-checkbox></td>
                        <td>{{n.id}}</td>
                        <td>{{n.name}}</td>
                    </tr>
                    <tr v-show="!addList">
                        <td colspan="3">{{waring}}</td>
                    </tr>
                </table>
            </div>
            <div v-show="!!addList">
                <pagegroup
                        :total="addsearchData.total"
                        :page_size.sync="addsearchData.maxResult"
                        :page_current.sync="addsearchData.page"
                        v-on:current_change="getfirstResult"
                        v-on:size_change="getfirstResult"
                ></pagegroup>
            </div>
            <div class="tc">
                <a class="btn btn-primary" @click="addTrue">添加选中商户</a>
                <a class="btn btn-gray" @click="addshow=false">取消</a>
            </div>
        </div>
    </content-dialog>
</activity-main>
</template>
<style type="text/css" scoped>
    .mr15{
        margin: 0 15px;
    }
    #all{
        display: none;
    }
    #all:checked + .KSNRCheckbox__skin:before {
        background: #00A5E0!important;
        opacity: 1;
    }
    .KSNRCheckbox__skin:before {
        content: '';
        display: inline-block;
        height: 10px;
        width: 10px;
        border-radius: 3px;
        opacity: 0;
        -webkit-transition: opacity .3s;
        transition: opacity .3s;
    }
</style>
<script type="text/javascript">
    import activityMain from './activity-main.vue'
    import model from '../../ajax/activity/basic_model'
    export default{
        data(){
            this.model=model(this)
            return{
                submitRemarks:'',
                waring:'请搜索商户',
                addshow:false,
                showstep:2,
                storeName: "",
                searchData:{
                    total:0,
                    activityId:0,
                    page: 1,
                    maxResult: 10,
                    storeName: ""
                },
                addsearchData:{
                    firstResult:0,
                    page: 1,
                    maxResult: 10,
                    total: 0,
                    name: "",
                    shopid: 0
                },
                dataList:[],
                searchList:[],
                addList:[],
                addIDs:[],
                ticketData:[]
            }
        },
        computed:{
            checkAll(){
                let clength=0;
                _.map(this.addList,(value)=>{
                    (!value.ischeck)?clength++:null;
                })
                return !clength
            }
        },
        methods:{
            dosearch(){
                this.addsearchData.page=1;
                this.getfirstResult();
            },
            getfirstResult(){
                this.addsearchData.firstResult=(this.addsearchData.page-1)*this.addsearchData.maxResult;
                this.getaddList();
            },
            chooseAll(){
                this.addIDs=[];
                let cloneData=_.cloneDeep(this.addList);
                if(this.checkAll){
                    _.map(cloneData,(value)=>{
                        value.ischeck=false;
                    })
                }else{
                    _.map(cloneData,(value)=>{
                        this.addIDs.push(value);
                        value.ischeck=true;
                    })
                }
                this.addList=cloneData;
            },
            checkeds(_list){
                if(!!_list.ischeck){
                    this.addIDs.push(_list);
                }else{
                    _.remove(this.addIDs, function(n) {
                        return n.id==_list.id;
                    })
                }
            },
            backBasic(){
                let ruleId='';
                !!sessionStorage.getItem('activityId')?ruleId=sessionStorage.getItem('activityId') << 0:ruleId=this.$route.params.tactivityId;
                (sessionStorage.getItem('props')=='online')?this.$router.go({'name':'latinos-receive',params:{'receiveId':ruleId}}):this.$router.go({'name':sessionStorage.getItem('rulename'),params:{'ruleId':ruleId}});
            },
            /**
             * @description 错误处理
             * @summary 只是简单的提示用处错误信息
             */
            errHandle (err) {
                dialog('info', err)
            },
            getList(){
                this.model.getBussinessList(this.searchData).then((res)=>{
                    if(res.data.code===0){
                        let data=[];
                        _.map(res.data.data,(val)=>{
                            data.push({
                                id:val.storeId,
                                name:val.storeName,
                                ticketId:val.ticketId,
                                ticketName:val.ticketName,
                                industry:val.industry
                            })
                        })
                        this.$set('searchList',data);
                        this.dataList=data;
                        this.searchData.total=res.data.total;
                    }
                })
            },
            getaddList(){
                this.addIDs=[];
                this.waring='未查询到商户数据';
                this.model.getAddBussinessList(this.addsearchData).then((res)=>{
                    if(res.data.code===0){
                        this.$set('addList',res.data.data);
                        this.addsearchData.total=res.data.total;
                    }
                })
            },
            addBtn(){
                this.addsearchData={
                    firstResult:0,
                    page: 1,
                    maxResult: 10,
                    total: 0,
                    name: "",
                    shopid: 0
                }
                this.addIDs=[];
                this.addData=[];
                this.waring='请搜索商户';
                this.model.getAddBussinessList(this.addsearchData).then((res)=>{
                    if(res.data.code===0){
                        this.$set('addList',res.data.data);
                        this.addsearchData.total=res.data.total;
                        this.addshow=true;
                    }
                })
            },
            addTrue(){
                if(!this.addIDs.length){
                    dialog('info','请勾选商户！');
                    return;
                }
                let checkeds=true;
                _.map(this.ticketData,(val)=>{
                    if(val.ischeck){
                        checkeds=false;
                    }
                })
                if(checkeds){
                    dialog('info','请勾选一个票务！');
                    return;
                }
                let data=_.cloneDeep(this.addIDs);
                let oldData=_.cloneDeep(this.dataList);
                let flag=true;
                for(let i=0;i<data.length;i++){
                    for(let m=0;m<this.ticketData.length;m++){
                        flag=true;
                        _.map(oldData,(val)=>{
                            if(val.id==data[i].id&&val.ticketId==this.ticketData[m].ticketId){
                                flag=false;
                            }
                        })
                        if(this.ticketData[m].ischeck&&flag){
                            oldData.push({id:data[i].id, name:data[i].name, industry:data[i].industry, ticketId:this.ticketData[m].ticketId, ticketName:this.ticketData[m].ticketName})
                        }
                    }
                }
                this.$set('searchList',oldData);
                this.dataList=this.searchList;
                this.addshow=false;
            },
            submitAdd(bool){
                let data={
                    step:this.showstep+1,
                    bankMarketingStores:[]
                };
                _.map(this.dataList,(val)=>{
                    data.bankMarketingStores.push({
                        ticketId:val.ticketId,
                        ticketName:val.ticketName,
                        storeId:val.id,
                        storeName:val.name
                    })
                })
//                if(!this.submitRemarks&&!this.dataList.length){
//                    dialog('info','请添加商户或输入备注信息！');
//                    return;
//                }
                data.activityId=sessionStorage.getItem('activityId') << 0||this.$route.params.tactivityId << 0;
                this.model.saveStore(data).then((res)=>{
                    if(res.data.code===0){
                        if(bool){
                            this.model.toCheck(data.activityId).then((res)=>{
                                if(res.data.code===0){
                                    dialog('successTime','保存成功！');
                                    this.$router.go({'name':'activity-manage'});
                                }
                            })
                        }else{
                            dialog('success','保存草稿成功！');
                            this.getList();
                        }
                    }
                })
            }
        },
        created(){
            let activityId = '';
            this.$route.params.tactivityId==':tactivityId'?activityId=sessionStorage.getItem('activityId') << 0:activityId = this.$route.params.tactivityId << 0;
            if (activityId) {
                // 获取活动信息
                this.searchData.activityId=activityId;
                this.model.geteditList(activityId).then((res)=>{
                    let ruleData=res.data.data.ruleAndLimit.tickets;
                    let checked=_.isArray(ruleData)?(!!ruleData&&!!ruleData.length):!!ruleData;
                    if(res.data.code===0&&checked){
                        _.map(ruleData,(val)=>{
                            this.ticketData.push({
                                ticketId:val.id,
                                ticketName:val.name
                            })
                        })
                    }
                })
                this.getList();
            }
        },
        components: { activityMain }
    }
</script>