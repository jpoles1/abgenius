import Vue from "vue";
import Router from "vue-router";
import ABGCalc from "./views/ABGCalc.vue";
import ABGQuiz from "./views/ABGQuiz.vue";

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
			path: "/quiz",
			name: "quiz",
			component: ABGQuiz,
		},
		{
			path: "/about",
			name: "about",
			// route level code-splitting
			// this generates a separate chunk (about.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import(/* webpackChunkName: "about" */ "./views/About.vue"),
		},
	],
});
