import protobuf from "protobufjs";
import { xhr } from './fetch';
import { find } from 'lodash';

export var resource = Object.create({});

export default function load(config) {
    if (resource._completed) {
        return new Promise((resolve, reject) => {
            resolve(resource);
        });
    }
    let {
        proto_files_path,
        proto_config_path,
    } = config;
    return new Build({
        proto_files_path,
        proto_config_path,
    });
}

function Build(config) {
    this._completed = false;
    this.config = config;
    this.proto_configs = {};
    this.proto_paths = [];
    this.proto_files = [];
    this._protos_load = {};

    // status!=200的反序列化信息
    this.errorMessage = null;
    this.ErrResponse = {
        proto_file_name: '',
        package_name: '',
        decode_name: ''
    }
    
    return new Promise((resolve, reject) => {
        this.loadProtoFiles();
        this.complate(resolve);
    });
}
Build.prototype.complate = function(callback) {
    Build.prototype.complate = callback;
    resource = this;
}

Build.prototype.loadProtoFiles = function() {
    let { proto_config_path} = this.config;
    xhr(`file://${proto_config_path}`, {}, (err, res) => {
        try {
            let result = JSON.parse(res);
            let { paths, ErrResponse} = result;
            this.proto_configs = paths;
            let protos = new Set();
            this.proto_paths = Object.keys(paths);
            this.proto_paths.forEach(d => {
                let protoName = paths[d].protoFileName;
                if (protoName) protos.add(protoName);
            });
            this.proto_files = [...protos];

            if (ErrResponse) {
                this.proto_files.push(ErrResponse.protoFileName);
                this.ErrResponse.proto_file_name = ErrResponse.protoFileName;
                this.ErrResponse.package_name = ErrResponse.packageName;
                this.ErrResponse.decode_name = ErrResponse.responseInstance;
            }
            this.runload(this.loadProtoFile());
        } catch (e) {

        }
    });
}

Build.prototype.runload = function(task) {
    let loadfile = task.next();
    if (!loadfile.done) {
        loadfile.value
            .then(res => {
                let [name, root] = res;
                this._protos_load[name] = root;
                this.runload(task);
            });
    } else {
        this._completed = true;

        let { proto_file_name, package_name, decode_name } = this.ErrResponse;
        let errorpb = this._protos_load[proto_file_name];
        this.errorMessage = errorpb && errorpb.lookupType(
            `${package_name}.${decode_name}`
        );
        this.errorMessage.__packageName = package_name;
        this.complate(this);
    }
}

Build.prototype.loadProtoFile = function* () {
    let { proto_files_path} = this.config;
    for (let name of this.proto_files) {
        yield protobuf.load(`file://${proto_files_path + name}`)
            .then(root => {
                return [name, root];
            });
    }
}

Build.prototype.getMessage = function({ method, path }) {
    let reqMethod = method.toUpperCase();
    let _path = find(this.proto_paths, (d) => {
        let mi = d.indexOf(' ');
        let _method = d.slice(0, mi);
        let p = d.slice(mi + 1);
        return _method.toUpperCase() === reqMethod && new RegExp(`(.*)${p}([?]*)`).test(path);
    });
    let requestModel;
    let responseModel;
    let pb = this.proto_configs[_path];
    if (pb) {
        let protoMessage = this._protos_load[pb.protoFileName];
        let requestInstance = pb.requestInstance;
        let responseInstance = pb.responseInstance && pb.responseInstance['200'];
        if (requestInstance && protoMessage) {
            requestModel = protoMessage.lookupType(`${pb.packageName}.${requestInstance}`);
            requestModel.__packageName = pb.packageName;
        }
        if (responseInstance && protoMessage) {
            responseModel = protoMessage.lookupType(`${pb.packageName}.${responseInstance}`);
            responseModel.__packageName = pb.packageName;
        }
    }
    return [requestModel, responseModel, this.errorMessage];
}
