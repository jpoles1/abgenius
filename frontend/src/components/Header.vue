<template>
	<div>
		<v-navigation-drawer v-model="drawer" app clipped mobile-break-point="600" width="180" touchless>
			<v-list shaped>
				<v-list-item link v-for="(navEntry, navIndex) in navList" :key="navIndex"
				:to="navEntry.url" @click="drawer=false;" :draggable="false">
					<v-list-item-icon v-if="navEntry.icon" style="margin-right: 0px;">
						<v-icon>{{navEntry.icon || "grip-lines"}}</v-icon>
					</v-list-item-icon>
					<v-list-item-content>
						<v-list-item-title style="font-size: 120%;">
							{{navEntry.name}}
						</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>
		<v-toolbar>
			<span v-if="$vuetify.breakpoint.xsOnly">
				<div @click="drawer = !drawer">
					<v-icon>fa-bars</v-icon>
				</div>
			</span>
			<v-toolbar-title class="headline">
				<a to="/" class="header-logo">
					<span>ABG</span>
					<span class="font-weight-light">enius</span>
				</a>
			</v-toolbar-title>
			<v-spacer v-if="$vuetify.breakpoint.smAndUp" />
			<span v-if="$vuetify.breakpoint.smAndUp">
				<v-btn :to="navEntry.url" class="header-nav"  v-for="(navEntry, navIndex) in navList" :key="navIndex">
					<span class="mr-2">{{navEntry.name}}</span>
					<v-icon>fas {{navEntry.icon}}</v-icon>
				</v-btn>
			</span>
		</v-toolbar>
	</div>
</template>

<script lang="ts">
	import Vue from "vue";
	export default Vue.extend({
		data() {
			return {
				drawer: false,
			};
		},
		computed: {
			navList(): any {
				const navList = [];
				if (this.$route.path !== "/train") {
					navList.push({ name: "Train", icon: "fa-question-circle", url: "/train" });
				}
				if (this.$route.path !== "/") {
					navList.push({ name: "Genius", icon: "fa-user-cog", url: "/" });
				}
				if (Object.keys(this.$store.state.jwtClaims).length === 0) {
					navList.push({ name: "Login", icon: "fa-key", url: "/login" });
				} else {
					navList.push({ name: "Profile", icon: "fa-id-card", url: "/profile" });
					navList.push({ name: "Logout", icon: "fa-door-open", url: "/logout" });
				}
				return navList;
			},
		},
	});
</script>

<style scoped>
	.header-logo{
		color: white;
		transition: 0.6s;
	}
	.header-logo:hover{
		color: #e06868;
		transition: 1.0s;
	}
	.header-nav{
		color: white;
		transition: 0.6s;
		transition-delay: 0s;
	}
	.header-nav:hover{
		color: #dc97ff;
		transition: 0.8s;
		transition-delay: 0s;
	}
</style>
