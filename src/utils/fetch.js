import transFormOptions from './transformOptions';
import datatypes from './datatypes';
export default function (options) {
    let {method, path} = options;
    let {init} = transFormOptions(options);
    if (init && init.headers) {
        init.headers = new Headers(init.headers);
    }
    let request = new Request(path, init);
    return fetch(request)
        .then(response => {
            if (response.status != 200) {
                return Object.assign(new Error(), {
                    response: response.status != 404 ? response.arrayBuffer() : 404,
                    status: response.status
                });
            } else {
                return {
                    response: response.arrayBuffer(),
                    status: response.status
                };
            }
        });
}

export function setPayload(payload, method) {
    let _payload = Object.create(null);
    if (!payload) return _payload;
    if (method.toUpperCase() !== 'GET') {
        payload.forEach(d => {
            let { key, value, type } = d;
            _payload[key] = datatypes[type] ? datatypes[type](value) : value;
        });
    }
    return _payload;
}

export function xhr(filename, options = {}, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange /* works everywhere */ = function fetchOnReadyStateChange() {

        if (xhr.readyState !== 4)
            return undefined;

        // local cors security errors return status 0 / empty string, too. afaik this cannot be
        // reliably distinguished from an actually empty file for security reasons. feel free
        // to send a pull request if you are aware of a solution.
        if (xhr.status !== 0 && xhr.status !== 200)
            return callback(Error("status " + xhr.status));

        // if binary data is expected, make sure that some sort of array is returned, even if
        // ArrayBuffers are not supported. the binary string fallback, however, is unsafe.
        if (options.binary) {
            var buffer = xhr.response;
            if (!buffer) {
                buffer = [];
                for (var i = 0; i < xhr.responseText.length; ++i)
                    buffer.push(xhr.responseText.charCodeAt(i) & 255);
            }
            return callback(null, typeof Uint8Array !== "undefined" ? new Uint8Array(buffer) : buffer);
        }
        return callback(null, xhr.responseText);
    };

    if (options.binary) {
        // ref: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data#Receiving_binary_data_in_older_browsers
        if ("overrideMimeType" in xhr)
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.responseType = "arraybuffer";
    }

    xhr.open("GET", filename);
    xhr.send();
}