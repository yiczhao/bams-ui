<template>
    <div class="include-area">
        <div class="search-div">
            <input class="input " type="text" v-model="searchData.name" placeholder="输入活动名称"
                   @keyup="getActivity($event)" @keyup.enter="searchList"
                   @keyup.up="changeLiIndex('up')" @keyup.down="changeLiIndex('down')"
            />
            <div class="showList showLi" v-show="showList">
                <ul class="showLi">
                    <li class="showLi" v-for="n in activityList" :class="{'checked':liIndex==$index}" @click="getId(n)">{{n.name}}</li>
                    <li class="showLi" v-if="!activityList.length">未查询到{{searchData.name}}活动</li>
                </ul>
            </div>
            <select class="select" v-model="searchData.type">
                <option value="">时间类型</option>
                <option value="all">累计</option>
                <option value="now">今日</option>
            </select>
            <a class="btn btn-primary" @click="searchList">搜 索</a>
        </div>
        <div class="right">展示所有正在进行中的活动今日、累计的刷卡数据，以及活动中不同商户交易、不同卡bin交易的笔数排行。</div>
        <div class="right">当前数据截止到小时,{{now}} (每整点更新数据)</div>
    </div>
    <div class="home">
        <div class="total-div">
            <div class="total left">
                <span>{{total.tradeAmount[0]}}.<i v-if="total.tradeAmount.length!=1">{{total.tradeAmount[1]}}</i><i v-else>00</i></span>
                <span>交易总金额(元)</span>
            </div>
            <div class="total center">
                    <span>{{total.tradeNum[0]}}</span>
                    <span>交易总笔数(笔)</span>
            </div>
            <div class="total right">
                <span>{{total.subsidyAmount[0]}}.<i v-if="total.subsidyAmount.length!=1">{{total.subsidyAmount[1]}}</i><i v-else>00</i></span>
                <span>补贴总金额(元)</span>
            </div>
        </div>
        <div class="top-ten">
            <div>
                <h4>商户刷卡笔数排行</h4>
                <ul>
                    <li v-for="n in TradeAreaNumList">
                        <span>{{$index + 1 }}</span>
                        <span>{{n.topName | substring 15}}</span>
                        <span><i>{{n.topValue}}</i>笔</span>
                    </li>
                </ul>
            </div>
            <div>
                <h4>卡bin刷卡笔数排行</h4>
                <ul>
                    <li v-for="n in CardBINTradeNumList">
                        <span>{{$index + 1 }}</span>
                        <span>{{n.topName | substring 15}}</span>
                        <span><i>{{n.topValue}}</i>笔</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script type="text/javascript">
    import model from '../ajax/common/home_model'
    export default{
        data(){
            this.model=model(this);
            return{
                now:stringify(new Date()),
                liIndex:0,
                total:{
                    tradeAmount:'',
                    tradeNum:'',
                    subsidyAmount:'',
                },
                activityList:[],
                TradeAreaNumList:[],
                CardBINTradeNumList:[],
                showList:false,
                searchData:{
                    type:'',
                    name:'',
                    activityID:'',
                     startDate:'',
                     endDate:'',
                     bankUuidString:'',
                },
                replaceName:'',
            }
        },
        methods:{
            searchList(){
                if(this.showList){
                    this.searchData.name=this.activityList[this.liIndex].name;
                    this.searchData.activityID=this.activityList[this.liIndex].uniqueId;
                }
                if(this.searchData.type=='now'){
                    this.searchData.startDate=stringify(new Date());
                    this.searchData.endDate=stringify(new Date());
                }else{
                    this.searchData.startDate='';
                    this.searchData.endDate='';
                }
                this.getList();
            },
            getActivity: _.debounce(function(e){
                if(e.keyCode == 38 || e.keyCode == 40|| e.keyCode == 13){  //向上向下
                    return ;
                }
                let vm=this;
                vm.replaceName=(vm.searchData.name).replace(/(^\s+)|(\s+$)/g, "");
                let data={
                    name:vm.replaceName,
                    maxResult:10,
                    uuids:_.split(sessionStorage.getItem('uuids'), ',')
                }
                if(!vm.replaceName){
                    vm.searchData.activityID="";
                    vm.showList=false;
                    return;
//                        vm.getList();
                }else{
                    vm.$common_model.getActivityList(data).then((res)=>{
                        if(res.data.code===0&&res.data.data!=vm.searchData.name){
                            this.liIndex=0;
                            vm.$set('activityList',res.data.data);
                            vm.showList=true;
                        }
                    })
                }
            },300),
            changeLiIndex(type){
                if(!this.activityList.length)return;
                switch (type){
                    case 'up':
                        this.liIndex==0?this.liIndex=this.activityList.length-1:this.liIndex--;
                        break;
                    case 'down':
                        this.liIndex==this.activityList.length-1?this.liIndex=0:this.liIndex++;
                        break;
                    default:
                        break;
                }
            },
            getList(){
                this.showList=false;
                this.searchData.bankUuidString=sessionStorage.getItem('uuids');
                let data={
                    activityID:this.searchData.activityID,
                    startDate:this.searchData.startDate,
                    endDate:this.searchData.endDate,
                    compareFlag:true,
                    // bankUuidString:sessionStorage.getItem('uuids')
                    bankUuidString:this.searchData.bankUuidString,
                };
                this.liIndex=0;
                // (!!this.searchData.activityID)? data.bankUuidString='':null;
                this.model.getTotal(data).then((res)=>{
                    var tradeAmount=String(res.data.data.tradeAmount);
                    var tradeNum=String(res.data.data.tradeNum);
                    var subsidyAmount=String(res.data.data.subsidyAmount);
                    this.total.tradeAmount=tradeAmount.split('.');
                    this.total.tradeNum=tradeNum.split('.');
                    this.total.subsidyAmount=subsidyAmount.split('.');
                })
                this.model.getTradeAreaNumList(data).then((res)=>{
                    this.$set('TradeAreaNumList',res.data.dataList);
                })
                this.model.getCardBINTradeNumList(data).then((res)=>{
                    this.$set('CardBINTradeNumList',res.data.dataList);
                })
            },
            getId({uniqueId,name}){
                this.showList=false;
                this.searchData.name=name;
                this.searchData.activityID=uniqueId;
            },
            resetName(){
                this.showList=false;
            }
        },
        ready() {
//            document.addEventListener('click', (e) => {
//                if (!e.target.classList.contains('showLi')) {
//                    this.resetName();
//                }
//            }, false);
        },
        beforeDestroy () {
            document.removeEventListener('click', this.resetName, false);
        },
        created(){
            formDataRequest('./bank/bank_list').get({'noPage':1}).then((res)=>{
                if(res.data.code===0){
                    let data=[]
                    let datas=[]
                    _.map(res.data.dataList,(val)=>{
                        (!!val.uuid)?data.push(val.uuid):null;
                        (!!val.uuid)?datas.push({
                            id:val.uuid,
                            name:val.shortName
                        }):null;
                    })
                    sessionStorage.setItem('uuids',_.join(data, ','));
                    sessionStorage.setItem('bankNames',JSON.stringify(datas));
                    this.getList();
                }
            });
        }
    }
</script>