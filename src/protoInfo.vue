<template>
    <div class="proto-form">
        <div class="request-froms">
            <div class="proto-item">
                <input
                type="text"
                v-model="protoDir"
                placeholder=".proto文件所在目录"
                class="url">
            </div>
            <div class="proto-item proto-files">
                <div class="proto-item">
                <input
                    type="input"
                    v-model="protoConfig"
                    placeholder="proto_config.json文件"
                    class="url">
                </div>
            </div>
            <button @click="buildProto" class="btn">编译</button>
        </div>
    </div>
</template>
<script>
import load from './utils/build-proto';
export default {
  name: "protoInfo",
  data() {
    return {
        protoDir: "",
        protoConfig: '',
    };
  },
  methods: {
    setConfig() {
        localStorage.setItem('protoDir', this.protoDir);
        localStorage.setItem('protoConfig', this.protoConfig);
      },
    buildProto() {
        this._load = load({
            proto_files_path: this.protoDir,
            proto_config_path: this.protoConfig,
        })
        .then(build => {
            this.$emit("loaded");
        });
        this.setConfig();
    },
  },
  created() {
      this.protoDir = localStorage.getItem('protoDir') || '';
      this.protoConfig = localStorage.getItem('protoConfig') || '';
  }
}
</script>
<style scoped>
.proto-form {
  padding-bottom: 10px;
}
.proto-item {
  vertical-align: top;
}
.proto-files {
  padding:10px 0;
}
.request-froms {
  display: inline-block;
  margin-right: 20px;
  vertical-align: top;
}
.url {
  width: 410px;
  height: 32px;
  line-height: 32px;
  border: none;
  border-bottom: 1px solid #ccc;
}
</style>

