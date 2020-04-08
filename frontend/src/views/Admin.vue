<template>
    <center v-if="$store.state.jwtClaims.isAdmin">
		<headful title="ABGenius - Profile"/>
		<br>
        <h1>Admin Control Panel</h1>
		<v-card style="margin: 30px auto; max-width: 90%; padding: 0;">
			<v-tabs>
				<v-tab href="#list-tab">User List</v-tab>
				<v-tab-item value="list-tab" class="profile-tab-item">
					{{profileList}}
					<div style="width: 100%; height: 500px; max-height: 75vh; overflow: auto;">
						<v-data-table
							:headers="profileTableHeaders"
							:items="profileList"
							class="elevation-1"
						>
							<template v-slot:items="profile">
							<td style="text-align: center;">{{profile.item.uname}}</td>
							<td style="text-align: center;">{{profile.item.fullName}}</td>	
							<td style="text-align: center;">{{profile.item.authProvider}}</td>
							<td style="text-align: center;">{{profile.item.learnerLevel}}</td>
							<td style="text-align: center;">{{profile.item.learnerLevelYears}}</td>
							<td style="text-align: center;">{{profile.item.isAdmin}}</td>
							</template>
						</v-data-table>
					</div>
				</v-tab-item>
			</v-tabs>
		</v-card>
    </center>
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
				profileList: [] as LearnerProfile[],
				profileTableHeaders: [
					{
						text: "Username", value: "uname",
						sortable: true, align: "center",
					},
					{
						text: "Full Name", value: "fullName",
						sortable: true, align: "center",
					},
					{
						text: "Auth Provider", value: "authProvider",
						sortable: true, align: "center",
					},
					{
						text: "Learner Level", value: "learnerLevel",
						sortable: true, align: "center",
					},
					{
						text: "Learner Level Years", value: "learnerLevelYears",
						sortable: true, align: "center",
					},
					{
						text: "Admin", value: "isAdmin",
						sortable: true, align: "center",
					},
				],
			};
		},
		methods: {
			fetchProfileList() {
				const url = this.$store.state.api_url + "/api/user/list";
				jajax.getJSON(url, this.$store.state.jwtToken).then((data: any) => {
					this.profileList = data || [];
				}).catch((err) => {
					this.$toast(`Failed to fetch profile data (Err Code: ${err.respCode})`, {color: "#d98303"});
				});

			},
		},
		mounted() {
			this.$nextTick(() => {
				this.fetchProfileList();
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