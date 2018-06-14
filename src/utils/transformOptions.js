export default function({path, method, payload}) {
    let init = {
        method,
        body: payload,
        headers: {
            'Content-Type': 'application/x-protobuf'
        },
        credentials: 'same-origin',
    }
    // path = path.split('/');
    // path = path.map(d => encodeURIComponent(d));
    // path = path.join('/');
    return {path, init};
}