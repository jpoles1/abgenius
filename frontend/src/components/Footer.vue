<template>
	<div class="footer">
		<hr>
		<div style="display: flex; justify-content: center; align-items: center;">
			<a href="http://help.jpoles1.com/" target="_blank">
				Support
			</a>
			<div class="bottom-nav-spacer"></div>
			<a href="/tos" target="_blank">
				Terms of Service
			</a>
			<div class="bottom-nav-spacer"></div>
			<a href="https://forms.gle/xXvu65bcWa3gpxE18" target="_blank">
				Feedback
			</a>
		</div>
	</div>
</template>

<script lang="ts">
	import Vue from "vue";
	export default Vue.extend({
	});
</script>

<style scoped>
	.bottom-nav-spacer::after{
		content: "|";
		margin: 0 12px;
		font-size: 150%;
		font-weight: bold;
		color: #ddd;
	}
	.footer {
		margin-bottom: 8px;
	}
	.footer, .footer a {
		color: white;
	}
</style>