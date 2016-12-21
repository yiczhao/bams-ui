export default function install(Vue,router_proto) {
    Vue.http.options.emulateJSON = false;
    window.origin && (Vue.http.options.root = window.origin );
    Vue.http.interceptors.push({
        request (request) {
            let bamtoken=(!!sessionStorage.getItem('loginList')) ? JSON.parse(sessionStorage.getItem('loginList')).token : null;
            request.headers['X-auth-Token'] =bamtoken;
            return request;
        },
        response (response) {
            if(response.data.code===-1){
                dialog('info',response.data.message)
            }
            if(response.data.code===1){
                dialog('error',response.data.message)
            }
            return response;
        }
    });
}