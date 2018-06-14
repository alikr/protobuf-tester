<template>
  <div class="dev-tool">
      <div class="list-head">
        <div class="close clear" @click="clear">x</div>
        <table class="table-list">
                <col width="">
                <col width="80">
                <col width="80">
                <col width="100">
                <col width="100">
                <col width="200">
                <thead>
                    <tr>
                        <th v-for="value in head" :key="value">{{value}}</th>
                    </tr>
                </thead>
            </table>
        </div>
        <div class="list-con">
            <div class="list-box">
                <table class="table-list">
                    <col width="">
                    <col width="80">
                    <col width="80">
                    <col width="100">
                    <col width="100">
                    <col width="200">
                    <tbody>
                    <tr v-for="(item,index) in list" class="list-item" :key="index">
                        <td
                            v-for="value in dataHead"
                            :key="value"
                            :style="{'color':item.networkInfo.response && item.networkInfo.response.status >= 400 ? '#f00' : null}">
                            <div
                                class="cell"
                                :title="setVal(item.networkInfo, value)"
                                @click="showDetail(index)">
                                {{setVal(item.networkInfo, value)}}
                                <span v-if="value==='time'">ms</span>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="detail" v-show="isDetail">
			<div class="close" @click="() => isDetail = false">x</div>
			<div class="tabs">
				<em @click="viewTab('preview')" :class="['tab-item',{'tab-active':tabKey==='preview'}]">Preview</em>
				<em @click="viewTab('raw')" :class="['tab-item',{'tab-active':tabKey==='raw'}]">Raw</em>
			</div>
			<div class="tab-content">
				<div class="tab-view">
					<div v-if="tabKey==='preview'">
						<h2>payload</h2>
						<vue-json-pretty :data="itemDetail.payload||''"></vue-json-pretty>
                        <h2>request</h2>
						<vue-json-pretty :data="itemDetail.request||''"></vue-json-pretty>
						<h2>response</h2>
						<vue-json-pretty :data="itemDetail.response||''"></vue-json-pretty>
						<!-- <h2>harlog</h2>
						<vue-json-pretty :data="itemDetail.harlog"></vue-json-pretty> -->
					</div>
					<div v-if="tabKey==='raw'">
						{{itemDetail}}
					</div>
				</div>
			</div>
		</div>
  </div>
</template>
<script>
import {mapState, mapActions} from 'vuex';
import {cloneDeep} from 'lodash';
import VueJsonPretty from 'vue-json-pretty';
export default {
    name: 'dev-tools',
    data() {
        return {
            head:['Name', 'Method', 'Staus', 'bodySize', 'Size', 'Time'],
            dataHead:[
                'request.url',
                'request.method',
                'response.status',
                'response.bodySize',
                'response._transferSize',
                'time'
            ],
            isDetail: false,
            itemDetail: {},
            tabKey: 'preview',
        }
    },
    computed: {
        ...mapState(['list'])
    },
    components: {
        VueJsonPretty
    },
    methods: {
        ...mapActions(['clear']),
        showDetail(index) {
            this.itemDetail = cloneDeep(this.list[index]);
            this.itemDetail.payload = this.itemDetail.networkInfo.payload;
            this.isDetail = true;
        },
        setVal(item, key) {
            var val;
            var keys = key.split('.');
            let i = -1;
            let size = keys.length;
            while (++i < size) {
                let k = keys[i];
                if (!k) break;
                val = val ? val[k] : item[k];
            }
            return val;
        },
        viewTab(key) {
            this.tabKey = key;
        }
    }
}
</script>
<style lang="css" scoped>
    .dev-tool{
        width:100%;
        height:100%;
    }
    .list-head{
        height:30px;
        line-height: 30px;
        position: relative;
    }
    .list-con{
        width:100%;
        height:100%;
        margin-top:-30px;
        padding-top:30px;
    }
    .list-box{
        height:100%;
        overflow: auto;
    }
	.table-list{
		width:100%;
		table-layout: fixed;
		border-collapse: collapse;
	}
	.table-list th,
	.table-list td{
		text-align: left;
		border-bottom:1px solid #E1E1E1;
	}
	.detail{
		position: absolute;
        right: 2px;
        top: 2%;
        width: 80%;
        height: 98%;
        background: #fff;
        border: 1px solid #ccc;
        overflow-y: auto;
        box-sizing: border-box;
        padding: 0 10px;
	}
	.tabs{
		width:100%;
		height:24px;
		line-height: 24px;
		box-sizing: border-box;
		padding-left:20px;
	}
	.tab-item{
		display: inline-block;
		vertical-align: middle;
		font-style: normal;
		padding:0 10px;
		color: #000;
		cursor:pointer;
	}
	.tab-active{
		color: #fff;
		background: #AAAAAA;
	}
	.tab-content{
		height:100%;
		margin-top: -40px;
		padding-top:40px;
		box-sizing: border-box;
	}
	.tab-view{
		height: 100%;
		overflow-y: auto;
	}
	.cell{
		width: 100%;
        padding: 6px 4px;
        cursor: pointer;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
	}
	.list-item:nth-child(odd) .cell{
		background: #F5F5F5;
	}
	.list-item:nth-child(even) .cell{
		background: #fff;
	}
	.close{
		position: absolute;
        left: 0;
        top: 0;
        width: 20px;
        height: 20px;
        line-height: 18px;
        vertical-align: middle;
        color: #000;
        text-align: center;
        background: #fff;
        font-size: 16px;
        cursor: pointer;
	}
    .clear{
        position: absolute;
        right:10px;
        left:auto;
        top:6px;
    }
</style>
