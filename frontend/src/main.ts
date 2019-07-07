import Vue from "vue";
import "./plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";

import headful from "vue-headful";
Vue.component("headful", headful);

import VuetifyToast from "vuetify-toast-snackbar";
Vue.use(VuetifyToast, {
	showClose: false,
	color: "#403e4d",
});

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount("#app");
