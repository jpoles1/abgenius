<template>
	<center style="padding: 20px;">
		<div v-if="answerData && answerData.length > 0">
			<learning-curve :answer-data="answerData" :width="360" :height="240"/>
		</div>
		<div v-else>
			<h2>There is no data to display.</h2>
			<h3><i>Please complete some more <a href="/train">questions</a></i></h3>
		</div>
	</center>
</template>

<script <script lang="ts">
	import * as jajax from "@/jajax";
	import LearningCurve from "@/components/LearningCurve.vue";
	import Vue from "vue";
	export default Vue.extend({
		components: {
			LearningCurve,
		},
		data() {
			return {
				answerData: [],
			};
		},
		mounted() {
			this.$nextTick(function() {
				const apiURL = this.$store.state.api_url + "/api/answer/list";
				jajax.getJSON(apiURL, this.$store.state.jwtToken).then((data: any) => {
					this.answerData = data.reverse();
				}).catch((err) => {
					this.$toast(`Failed to fetch answer data (Err Code: ${err.respCode})`, {color: "#d98303"});
				});
			});
		},
	});
</script>
