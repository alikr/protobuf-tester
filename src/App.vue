<template>
  <div class="main">
    <div class="log-list">
      <div class="log-con">
        <div
          v-for="(item,index) in logs"
          @click="restoreForms(item)"
          :key="index" class="log-item">
          <span class="log-method">
            {{item.method.toUpperCase()}}
          </span>
          {{item.url}}
        </div>
      </div>
    </div>
    <div class="form">
			<div class="form-box">
        <proto-info @loaded="showForms" ref="protoInfo"></proto-info>
        <div class="form-con" v-if="showForm">
          <input
            type="text"
            v-model="url"
            class="url"
            placeholder="请输入URL"
            @change="changeParams">
          <select
            v-model="method"
            style="height:34px" @change="changeParams">
            <option
              v-for="item in methods"
              :key="item"
              :value="item">{{item}}</option>
          </select>
          <button @click="send" class="btn">发送</button>
          <div
            v-if="method!=='GET'"
            v-for="(item, index) in forms"
            :key="index"
            class="form-item">
            <div v-if="item.repeated" class="repeated">
              <div>{{item.key}}</div>
            </div>
            <div v-else class="form-key"
              :style="{'padding-bottom':item.repeat_end ? '20px' : null}">
              <input
                @focus="insertFormItem(index)"
                type="text"
                v-model="item.key"
                class="input" placeholder="Key">
              <input
                @focus="insertFormItem(index)"
                type="text"
                v-model="item.value"
                class="input"
                placeholder="Value">
              <select
                style="height:34px;margin-left:-6px;"
                v-model="item.type">
                <option
                  v-for="(value, key) in datatypes"
                  :key="key"
                  :value="key">{{key}}</option>
              </select>
              <div
                v-if="index > 0"
                class="form-item--delete"
                @click="removeItem(index)">X</div>
            </div>
          </div>
        </div>
        <div class="response-info" v-if="!isPending">
          <!-- <div>
            <h2>request:</h2>
            <dl v-for="(item,index) in forms" :key="index">
              <dt>{{item.key}}</dt>
              <dd>{{item.value}}</dd>
            </dl>
          </div> -->
          <div class="response">
            <h2>response: <b>{{status}}</b></h2>
            <h3 class="h3">decodeName: <b>{{decodeName}}</b></h3>
            <div class="tabs">
              <em
                @click="viewTab('preview')"
                :class="['tab-item',{'tab-active':tabKey==='preview'}]">Preview</em>
              <em
                @click="viewTab('raw')"
                :class="['tab-item',{'tab-active':tabKey==='raw'}]">Raw</em>
            </div>
            <div v-if="tabKey==='raw'">
                {{response}}
              </div>
            <div v-else>
              <vue-json-pretty :data="response"></vue-json-pretty>
            </div>
          </div>
        </div>
		  </div>
	  </div>
  </div>
</template>
<script>
import VueJsonPretty from "vue-json-pretty";
import fetch, { setPayload } from "./utils/fetch";
import datatypes from "./utils/datatypes";
import protoInfo from "./protoInfo.vue";
import { cloneDeep } from "lodash";
import { resource } from "./utils/build-proto";
const DECODE = ["_responseMessage", "_errorMessage"];
export default {
  name: "test",
  data() {
    return {
      showForm: false,
      datatypes,
      url: "",
      method: "GET",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      forms: [{ key: "", value: "", type: "string" }],
      logs: [],
      isPending: true,
      response: {},
      status: "",
      tabKey: "preview",
      decodeName: "" // 反序列化名称
    };
  },
  components: {
    protoInfo,
    VueJsonPretty
  },
  methods: {
    viewTab(key) {
      this.tabKey = key;
    },
    send() {
      this.clearResponse();
      let options = {
        baseUrl: "",
        path: this.url,
        method: this.method
      };
      this.setModels(options);
      if (this._requestMessage && this.method.toUpperCase() !== "GET") {
        let payload = setPayload(this.forms, this.method);
        let message = this._requestMessage.create(payload);
        let buffer = this._requestMessage.encode(message).finish();
        // console.log('payload', this._requestMessage.decode(buffer));
        options.payload = buffer;
      }
      fetch(options)
        .then(res => {
          return this.getResponse(res);
        })
        .then(response => {
          this.isPending = false;
          this.logs.push({
            url: this.url,
            method: this.method,
            forms: cloneDeep(this.forms)
          });
          this.response = response;
        });
    },
    getResponse(res) {
      let { response, status } = res;
      this.status = status;
      if (this._responseMessage) {
        let isError = res instanceof Error;
        let index = 0;
        if (isError) {
          index = 1;
        }
        return new Promise((resolve, reject) => {
          resolve(response);
        }).then(response => {
          let model = this[DECODE[index]];
          this.decodeName = model.__packageName + "." + model.name;
          let data;
          if (model) {
            let message = this[DECODE[index]].decode(new Uint8Array(response));
            data = this[DECODE[index]].toObject(message, {
              defaults: true,
            });
          } else {
            data = response;
          }
          return data;
        });
      } else {
        return response;
      }
    },
    clearResponse() {
      this.isPending = true;
      this.response = {};
      this.status = "";
    },
    restoreForms(item) {
      this.clearResponse();
      this.url = item.url;
      this.method = item.method;
      this.setDefaultForms(item.forms);
    },
    setDefaultForms(data) {
      this.forms = data;
    },
    removeItem(index) {
      this.forms.splice(index, 1);
    },
    insertFormItem(index) {
      this.clearResponse();
      if (!this.forms[index + 1]) {
        this.forms.push({ key: "", value: "", type: "string" });
      }
    },
    showForms() {
      this.showForm = true;
    },
    setModels(options) {
      let message = resource.getMessage(options);
      this._requestMessage = message[0];
      this._responseMessage = message[1];
      this._errorMessage = message[2];
    },
    changeParams() {
      this.clearResponse();
      this.showForms();
      this.setModels({ method: this.method, path: this.url });
      if (this._requestMessage) {
        let { fields, __packageName } = this._requestMessage;
        // console.log(this._requestMessage)
        let forms = [];
        this.mapFields(forms, fields, __packageName);
        this.forms = forms;
      } else {
        this.forms = [{ key: "", value: "", type: "string" }];
      }
    },
    mapFields(forms, _fields, package_name, repeat_type) {
      let size = Object.keys(_fields).length;
      let index = 1;
      for (let key in _fields) {
        let repeat_end = repeat_type && index === size;
        let { type, repeated } = _fields[key];
        forms.push({ key, type, repeated, repeat_end });
        if (repeated) {
          let message = this._requestMessage.lookupType(
            `${package_name}.${type}`
          );
          let { fields } = message;
          this.mapFields(forms, fields, package_name, type);
        }
        index += 1;
      }
    }
  },
  created() {}
};
</script>
<style lang="css">
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-size: 14px;
  overflow: hidden;
}
.main {
  height: 100%;
  box-sizing: border-box;
}
.log-list {
  float: left;
  width: 300px;
  height: 100%;
  background: #fafafa;
}
.log-con {
  height: 100%;
  overflow: auto;
}
.log-method {
  display: inline-block;
  padding: 0 4px;
  border-radius: 4px;
  background: #999;
  color: #fff;
  vertical-align: middle;
}
.log-item {
  line-height: 24px;
  word-wrap: break-word;
  white-space: normal;
  cursor: pointer;
}
.response-info {
  word-break: break-all;
}
dt {
  font-weight: bold;
}
dt,
dd {
  display: inline-block;
  vertical-align: middle;
}
.form {
  height: 100%;
  margin-left: 310px;
  box-sizing: border-box;
}
.form-con {
  overflow: hidden;
}
.form-box {
  height: 100%;
  overflow: auto;
}
.form-item--delete {
  display: inline-block;
  width: 16px;
  height: 16px;
  line-height: 16px;
  font-size: 12px;
  border-radius: 8px;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  color: #fff;
  background: #000;
  margin-left:10px;
}
.url {
  width: 410px;
  height: 32px;
  line-height: 32px;
  border: none;
  border-bottom: 1px solid #ccc;
}
.input {
  width: 200px;
  height: 32px;
  line-height: 32px;
  margin: 0 10px 10px 0;
  border: none;
  border-bottom: 1px solid #ccc;
}
.btn {
  height: 32px;
  line-height: 32px;
  padding: 0 20px;
  background: #005bc5;
  color: #fff;
  border: none;
  cursor: pointer;
}
.btn:hover {
  background: #007acc;
}
.form-item {
  font-size: 0;
}
.tabs {
  width: 100%;
  height: 24px;
  line-height: 24px;
  box-sizing: border-box;
}
.tab-item {
  display: inline-block;
  vertical-align: middle;
  font-style: normal;
  padding: 0 10px;
  color: #000;
  cursor: pointer;
}
.tab-active {
  color: #fff;
  background: #aaaaaa;
}
h3 {
  color: #ccc;
  font-weight: normal;
}
.repeated{
  color:#999;
  font-size:14px;
  padding-top:10px;
}
</style>