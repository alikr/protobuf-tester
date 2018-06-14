import Vue from 'vue';
import Devtool from '@src/devtool.vue';
import store from './devtool-store.js';
// import load from '@src/utils/build-proto';
// import base64 from 'base64-arraybuffer';
var resource;
new Vue({
    extends: Devtool,
    store,
}).$mount('#app');

// let proto_files_path = localStorage.getItem('protoDir') || '';
// let proto_config_path = localStorage.getItem('protoConfig') || '';
// load({
//     proto_files_path,
//     proto_config_path,
// })
// .then(build => {
//     resource = build;
// });

chrome.runtime.onMessage.addListener(result => {
    // if (resource) {
    //     let {method, url} = result.networkInfo.request;
    //     let message = resource.getMessage({
    //         method: method,
    //         path: url
    //     });
    //     let [requestMessage, responseMessage, errMessage] = message;
    //     if (responseMessage && result.response) {
    //         let bufferArray = base64.decode(result.response);
    //         result.response = responseMessage.decode(new Uint8Array(bufferArray));
    //     }
    // }
    store.dispatch('push', result);
});