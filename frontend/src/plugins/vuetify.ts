import Vue from "vue";
import Vuetify from "vuetify";
//import "vuetify/src/stylus/app.styl";
import "vuetify/dist/vuetify.min.css";

Vue.use(Vuetify);

export default new Vuetify({
	iconfont: "fa",
	theme: {
		dark: true,
		themes: {
			dark: {
				"primary": "#1976D2",
				"secondary": "#424242",
				"accent": "#009688",
				"error": "#FF5252",
				"info": "#ffc107",
				"success": "#4CAF50",
				"warning": "#FB8C00",
			},
		},
	},
});

import VuetifyToast from "vuetify-toast-snackbar";
Vue.use(VuetifyToast, {
	showClose: false,
	color: "#403e4d",
});
