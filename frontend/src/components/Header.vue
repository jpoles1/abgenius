<template>
	<v-toolbar app>
		<v-toolbar-title class="headline">
			<a to="/" class="header-logo">
				<span>ABG</span>
				<span class="font-weight-light">enius</span>
			</a>
		</v-toolbar-title>
		<v-spacer></v-spacer>
		<v-btn to="/" v-if="$route.path != '/'" class="header-nav">
			<span class="mr-2">Genius</span>
			<v-icon>fas fa-user-cog</v-icon>
		</v-btn>
		<v-btn to="/train" v-if="$route.path != '/train'" class="header-nav">
			<span class="mr-2">Train</span>
			<v-icon>fas fa-question-circle</v-icon>
		</v-btn>
		<v-btn to="/login" v-if="Object.keys($store.state.jwtClaims).length === 0" class="header-nav">
			<span class="mr-2">Login</span>
			<v-icon>fas fa-key</v-icon>
		</v-btn>
		<span v-else>
			<v-btn to="/profile" class="header-nav">
				<span class="mr-2">Profile</span>
				<v-icon>fas fa-id-card</v-icon>
			</v-btn>
			<v-btn to="/logout" class="header-nav">
				<span class="mr-2">Logout</span>
				<v-icon>fas fa-door-open</v-icon>
			</v-btn>
		</span>
	</v-toolbar>
</template>

<script lang="ts">
	import Vue from "vue";
	export default Vue.extend({
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
	}</style>
