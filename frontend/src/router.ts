import Vue from "vue";
import Router from "vue-router";
import Login from "./views/Login.vue";
import UserProfile from "./views/UserProfile.vue";
import Authorize from "./views/Authorize.vue";
import Logout from "./views/Logout.vue";
import ABGCalc from "./views/ABGCalc.vue";
import ABGTrain from "./views/ABGTrain.vue";
import TrainDash from "./views/TrainDash.vue";
import TOS from "./views/TOS.vue";

Vue.use(Router);

export default new Router({
	mode: "history",
	base: process.env.BASE_URL,
	routes: [
		{
			path: "/",
			name: "home",
			component: ABGCalc,
		},
		{
			path: "/train",
			name: "train",
			component: ABGTrain,
		},
		{
			path: "/dash",
			name: "dash",
			component: TrainDash,
		},
		{
			path: "/profile",
			name: "profile",
			component: UserProfile,
		},
		{
			path: "/login",
			name: "login",
			component: Login,
		},
		{
			path: "/auth/:provider",
			component: Authorize,
			props: true,
		},
		{
			path: "/logout",
			name: "logout",
			component: Logout,
		},
		{
			path: "/about",
			name: "about",
			// route level code-splitting
			// this generates a separate chunk (about.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import(/* webpackChunkName: "about" */ "./views/About.vue"),
		},
		{
			path: "/tos",
			name: "tos",
			component: TOS,
		},
	],
});
