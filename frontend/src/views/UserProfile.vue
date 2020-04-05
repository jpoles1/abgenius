<template>
	<div>
		<headful title="ABGenius - Profile"/>
		<v-card style="margin: 30px auto; max-width: 660px; padding: 0;">
			<v-tabs>
				<v-tab href="#progress-tab">Progress</v-tab>
				<v-tab href="#info-tab">Profile</v-tab>
				<v-tab-item value="info-tab" class="profile-tab-item">
					<h1>Learner Profile</h1>
					<v-divider />
					<b style="font-size: 145%">What is your current level of training?</b>
					<div style="display: flex; font-size: 22px; margin-top: 16px;" class="learner-profile-input">
						<v-select v-model="profile.learnerLevel" :items="TrainingLevels" style="max-width: 240px; font-size:22px" outline @change="saveProfile"/>
						<div style="margin: 0 12px; font-size: 28px; padding-top: 6px;">year</div>
						<v-text-field type="number" min=1 max=99 v-model.number="profile.learnerLevelYears" style="max-width: 90px; font-size:22px" outline class="learner-year" @change="saveProfile"/>
					</div>
				</v-tab-item>
				<v-tab-item value="progress-tab" class="profile-tab-item">
					<learning-curve :answer-data="answerData" :width="380" :height="260" style="margin: auto"/>
					<v-divider/>
					<disorder-detective :answer-data="answerData"/>
				</v-tab-item>
			</v-tabs>
		</v-card>
	</div>
</template>

<script lang="ts">
	import * as jajax from "@/jajax";
	import Vue from "vue";
	import { BloodGas, DisturbType, RefRngs, RefRngMidpoint, ABGAnswer } from "@/components/BloodGas";
	import { TrainingLevels, LearnerProfile } from "@/components/LearnerProfile";
	import LearningCurve from "@/components/LearningCurve.vue";
	import DisorderDetective from "@/components/DisorderDetective.vue";

	export default Vue.extend({
		components: {
			LearningCurve,
			DisorderDetective,
		},
		data() {
			return {
				profile: {
					learnerLevel: undefined as string | undefined,
					learnerLevelYears: undefined as number | undefined,
				},
				TrainingLevels,
				answerData: [] as ABGAnswer[],
			};
		},
		methods: {
			saveProfile() {
				const url = this.$store.state.api_url + "/api/user/profile";
				jajax.postJSON(url, this.profile, this.$store.state.jwtToken).then((data: any) => {
					this.$toast("Saved changes to profile!");
				}).catch((err) => {
					this.$toast(`Failed to fetch answer data (Err Code: ${err.respCode})`, {color: "#d98303"});
				});

			},
			fetchProfile() {
				const url = this.$store.state.api_url + "/api/user/profile";
				jajax.getJSON(url, this.$store.state.jwtToken).then((data: any) => {
					this.profile = data;
				});
			},
			loadAnswerData(): Promise<any> {
				const apiURL = this.$store.state.api_url + "/api/answer/list";
				return jajax.getJSON(apiURL, this.$store.state.jwtToken).then((data: any) => {
					this.answerData = (data || []).reverse();
				}).catch((err) => {
					this.$toast(`Failed to fetch answer data (Err Code: ${err.respCode})`, {color: "#d98303"});
				});
			},
		},
		mounted() {
			this.$nextTick(() => {
				this.fetchProfile();
				this.loadAnswerData();
			});
		},
	});
</script>

<style>
	.learner-profile-input .v-select__selections {
		padding-top: 2px !important;
	}
	.learner-year input {
		margin-top: 10px !important;
		text-align: center;
	}
	.profile-tab-item {
		padding: 16px;
	}
</style>