<template>
	<v-container>
		<headful
			title="ABGenius - Calculator"
		/>
		<v-form v-model="validABG" class="abg-form">
			<div v-if="showDemographics">
				<center><h2>Patient Demographics</h2></center><br>
				<v-layout text-xs-center wrap justify-center>
					<v-select
						v-model="userBloodGas.abg.patientSex"
						:items='["Male", "Female"]'
						label="Patient Sex"
						outline class="numeric-input"
					></v-select>
					<v-text-field 
						v-model.number="userBloodGas.abg.patientAge" 
						type="number" label="Patient Age"
						outline class="numeric-input" step="1"
					></v-text-field>
				</v-layout>
			</div>
			<center><h2>Arterial Blood Gas</h2></center>
			<v-layout text-xs-center wrap justify-center style="margin-top: 8px;">
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field
								v-model.number="userBloodGas.abg.pH" 
								type="number" label='Serum pH'
								outline class="numeric-input" step="0.01"
								min="6" max="14" @input="editedABG"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.apH.lower + " - " + refRngs.apH.upper + ")"}}
					</span>
				</v-tooltip>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field
								v-model.number="userBloodGas.abg.bicarb" 
								type="number" label='Serum Bicarb'
								outline class="numeric-input" step="0.5"
								min="0" @input="editedABG"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.aBicarb.lower + " - " + refRngs.aBicarb.upper + ")"}}
					</span>
				</v-tooltip>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field
								v-model.number="userBloodGas.abg.PaCO2" 
								type="number" label='PaCO2'
								outline class="numeric-input" step="0.5"
								min="0" @input="editedABG"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.PaCO2.lower + " - " + refRngs.PaCO2.upper + ")"}}
					</span>
				</v-tooltip>
				<v-tooltip top v-if="showPaO2">
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field
								v-model.number="userBloodGas.abg.PaO2" 
								type="number" label='PaO2'
								outline class="numeric-input" step="0.5"
								min="0" @input="editedABG"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + results.adjustedPaO2.lower + " - " + results.adjustedPaO2.upper + ")"}}
					</span>
				</v-tooltip>
			</v-layout>
			<center><h2>Electrolytes</h2></center>
			<v-layout text-xs-center wrap justify-center style="margin-top: 8px;">
				 <v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field
								v-model.number="userBloodGas.abg.Na" 
								type="number" label='Serum Sodium'
								outline class="numeric-input" step="0.5"
								min="0" @input="editedABG"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.Na.lower + " - " + refRngs.Na.upper + ")"}}
					</span>
				</v-tooltip>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field
								v-model.number="userBloodGas.abg.Cl" 
								type="number" label='Serum Chloride'
								outline class="numeric-input" step="0.5"
								min="0" @input="editedABG"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.Cl.lower + " - " + refRngs.Cl.upper + ")"}}
					</span>
				</v-tooltip>
				<!-- <v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field
								v-model.number="userBloodGas.abg.K" 
								type="number" label='Serum Potassium'
								outline class="numeric-input" step="0.5"
								min="0"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.K.lower + " - " + refRngs.K.upper + ")"}}
					</span>
				</v-tooltip> -->
				<v-tooltip top>
					<template v-slot:activator="{ on }" v-if="userBloodGas.abg.Albumin">
						<div v-on="on">
							<v-text-field
								v-model.number="userBloodGas.abg.Albumin" 
								type="number" label='Serum Albumin'
								outline class="numeric-input" step="0.5"
								min="0" @input="editedABG"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.Albumin.lower + " - " + refRngs.Albumin.upper + ")"}}
					</span>
				</v-tooltip>
				<v-tooltip top v-if="showLactate">
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field
								v-model.number="userBloodGas.abg.Lactate" 
								type="number" label='Arterial Lactate'
								outline class="numeric-input" step="0.1"
								min="0" @input="editedABG"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.aLactate.lower + " - " + refRngs.aLactate.upper + ")"}}
					</span>
				</v-tooltip>
			</v-layout>
		</v-form>
		<hr style="margin: 0; border-color: #9b9b9b;">
		<div id="abggen" style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; transform: scale(0.8);">
			<div style="width: 380px;" :class="{'user-edited-abg': userEditedABG}">
				<v-select v-model="abgGenPick" :items="abgGenOptions"/>
			</div>
			<v-btn color="primary" @click="generateABG" style="margin: 0 5px 0 15px; transform: scale(0.9);">
				Generate
			</v-btn>
			<v-btn color="primary" @click="shuffleABG" style="margin: 0 15px 0 5px; transform: scale(0.9);">
				<v-icon>
					fa fa-random
				</v-icon>
			</v-btn>
		</div>
		<hr style="margin: 0 0 14px 0; border-color: #9b9b9b;">
		<v-layout wrap justify-center id="info-chips">
			<div class="instruction-box">
				<b>Step 1: Assess Overall Blood pH</b>
				<br>
				<v-chip label @click="activateChipInfo('pH')" v-if="!results.realisticABG">
					<v-avatar class="error">        
						<v-icon>fas fa-question</v-icon>
					</v-avatar>
					<b>Check ABG</b>
				</v-chip>
				<v-chip label @click="activateChipInfo('pH')">
					<v-avatar class="error" v-if="results.pHDisturbance != 'Normal'">        
						<v-icon v-if="results.pHDisturbance == 'Alkalemia'">fas fa-arrow-up</v-icon>
						<v-icon v-if="results.pHDisturbance == 'Acidemia'">fas fa-arrow-down</v-icon>
					</v-avatar>
					<v-avatar class="success" v-else>        
						<v-icon small>fas fa-check</v-icon>
					</v-avatar>
					<b>Blood pH:</b>&nbsp;{{results.pHDisturbance}}
				</v-chip>
			</div>
			<div class="instruction-box">
				<b>Step 2: Mind the Gap(s)</b>
				<br>
				<v-chip label v-if="results.serumAnionGap.disturb != undefined" @click="activateChipInfo('anionGap')">
					<v-avatar class="error" v-if="results.serumAnionGap.disturb == 'Anion Gap'">        
						<v-icon>fas fa-arrows-alt-h</v-icon>
					</v-avatar>
					<v-avatar class="success" v-if="results.serumAnionGap.disturb == 'Normal'">        
						<v-icon small>fas fa-check</v-icon>
					</v-avatar>
					<b>Anion Gap:</b>&nbsp; {{results.serumAnionGap.gap.toFixed(1)}}
				</v-chip>
				<v-chip label v-if="results.serumDeltaGap.disturb != undefined && results.serumAnionGap.disturb == 'Anion Gap'" @click="activateChipInfo('deltaGap')">
					<v-avatar class="error" v-if="results.serumDeltaGap.disturb == 'Delta Gap'">        
						<v-icon>fas fa-arrows-alt-h</v-icon>
					</v-avatar>
					<v-avatar class="success" v-if="results.serumDeltaGap.disturb == 'Normal'">        
						<v-icon small>fas fa-check</v-icon>
					</v-avatar>
					<b>Delta Gap:</b>&nbsp; {{results.serumDeltaGap.gap.toFixed(1)}}
				</v-chip>
			</div>
			<div class="instruction-box" v-if="results.serumAnionGap.disturb == 'Anion Gap'">
				<b>Step 3: Add Anion Gap Acidosis</b>
				<br>
				<v-chip label  @click="activateChipInfo('anionGap')">
					<v-avatar class="warning">
						<v-icon small>
							fa-vial
						</v-icon>
					</v-avatar>
					<div>
						Anion Gap Metabolic Acidosis
					</div>
				</v-chip>
			</div>
			<div class="instruction-box" v-if="results.serumAnionGap.disturb == 'Anion Gap' && results.serumDeltaGap.disturb == 'Delta Gap'">
				<b>Step 4: Account for Delta Gap</b>
				<br>
				<v-chip label  @click="activateChipInfo('deltaGap')">
					<v-avatar class="warning">
						<v-icon small>
							fa-vial
						</v-icon>
					</v-avatar>
					<div>						
						{{results.disturbances[1]}}
					</div>
				</v-chip>
			</div>
			<!--<div class="instruction-box" v-if="results.serumAnionGap.disturb == 'Anion Gap' && results.serumDeltaGap.disturb == 'Delta Gap'">
				<b>Step 5: Respiratory compensation/process</b>
				<br>
				<v-chip label @click="activateChipInfo('Compensatory ' + (results.expectedCompensation))">
					<v-avatar :class="results.completeCompensation ? 'success' : 'warning'">
						<v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(results.expectedCompensation)'>
							fa-wind
						</v-icon>
						<v-icon small v-else-if='["Non-Gap Metabolic Acidosis", "Metabolic Alkalosis"].includes(results.expectedCompensation)'>
							fa-vial
						</v-icon>
					</v-avatar>
					<div v-if="results.completeCompensation">
						Complete Compensation
					</div>
					<div v-else>
						Incomplete Compensation
					</div>
				</v-chip>
			</div>-->
			<div class="instruction-box" v-if="results.serumAnionGap.disturb !== 'Anion Gap' && results.disturbances.length > 0">
				<b>Step 3: Check Primary Disturbance</b>
				<br>
				<v-chip label @click="activateChipInfo('Primary ' + results.disturbances[0])">
					<v-avatar class="warning" v-if="results.disturbances[0] !== 'Normal'">
						<v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(results.disturbances[0])'>
							fa-wind
						</v-icon>
						<v-icon small v-else-if='["Non-Gap Metabolic Acidosis", "Metabolic Alkalosis"].includes(results.disturbances[0])'>
							fa-vial
						</v-icon>
					</v-avatar>
					<v-avatar class="success" v-else>        
						<v-icon small>fas fa-check</v-icon>
					</v-avatar>
					<div v-if="results.disturbances[0] !== 'Normal'">
						{{results.disturbances[0]}}
					</div>
					<div v-else>
						None Detected
					</div>
				</v-chip>
			</div>
			<div class="instruction-box" v-if="!(results.serumAnionGap.disturb == 'Anion Gap' && results.serumDeltaGap.disturb == 'Delta Gap') && results.disturbances[0] !== 'Normal'">
				<b>Step 4: Check For Compensation</b>
				<br>
				<v-chip label @click="activateChipInfo('Compensatory ' + (results.expectedCompensation))">
					<v-avatar :class="results.completeCompensation ? 'success' : 'warning'">
						<v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(results.expectedCompensation)'>
							fa-wind
						</v-icon>
						<v-icon small v-else-if='["Non-Gap Metabolic Acidosis", "Metabolic Alkalosis"].includes(results.expectedCompensation)'>
							fa-vial
						</v-icon>
					</v-avatar>
					<div v-if="results.completeCompensation">
						Complete Compensation
					</div>
					<div v-else>
						Incomplete Compensation
					</div>
				</v-chip>
			</div>
		</v-layout>
		<div style="max-width: 800px; margin: 15px auto; font-size: 80%; font-style: italic;">
			DISCLAIMER: None of the information supplied herein is to be used as a substitute for sound clinical judgement from an appropriately trained and accredited medical professional. 
			Reference ranges may vary, please compare with your those from your lab. 
			Please <a href="/tos" target="_blank" style="color: white; text-decoration: none;">see our ToS</a> for more info.
		</div>
		<hr>
		<div id="info-panel-container">
			<transition name="infos" mode="out-in">
				<CalcInfoPanel id="info-panel" v-if="activeChip !== undefined" style="margin-bottom: 20px;"
				:activeChip="activeChip" :abg="userBloodGas.abg" :results="results"/>
			</transition>
		</div>
		<v-expansion-panel>
			<v-expansion-panel-content>
				<template v-slot:header>
					<div>Davenport Diagram</div>
				</template>
				<v-card style="padding: 20px; box-shadow: 0px 0px 5px #202020 inset !important; overflow: auto;">
					<mini-davenport :answer-data="userBloodGas" style="margin: auto;"/>
				</v-card>
			</v-expansion-panel-content>
		</v-expansion-panel>
		<br><br>
		<ReferenceList/>
	</v-container>
</template>

<script lang="ts">
	import * as BG from "@/components/BloodGas";
	import { abgGenerators } from "@/components/BloodGasGen";
	import CalcInfoPanel from "@/components/CalcInfoPanel.vue";
	import MiniDavenport from "@/components/MiniDavenport.vue";
	import ReferenceList from "@/components/ReferenceList.vue";

	import Vue from "vue";
	import goTo from "vuetify/lib/components/Vuetify/goTo";
	export default Vue.extend({
		components: {
			CalcInfoPanel,
			MiniDavenport,
			ReferenceList,
		},
		data() {
			return {
				abgGenPick: Object.keys(abgGenerators)[0],
				abgGenOptions: Object.keys(abgGenerators),
				userEditedABG: true,
				showDemographics: false,
				showPaO2: false,
				showLactate: false,
				activeChip: undefined as string | undefined,
				validABG: true,
				refRngs: BG.RefRngs,
				userBloodGas: abgGenerators["Normal"](true)[0],
				results: {
					serumAnionGap: {gap: NaN, disturb: BG.DisturbType.Unknown} as BG.Gap,
					serumDeltaGap: {gap: NaN, disturb: BG.DisturbType.Unknown} as BG.Gap,
					adjustedPaO2: {lower: 80, upper: 100} as BG.RefRange,
					pHExpected: 7.4,
					realisticABG: true,
					o2Disturbance: BG.DisturbType.Normal,
					pHDisturbance: BG.DisturbType.Normal,
					disturbances: [BG.DisturbType.Unknown] as BG.DisturbType[],
					expectedCompensation: undefined as BG.DisturbType | undefined,
					completeCompensation: false,
				},
				inputDebounce: undefined as number | undefined,
			};
		},
		watch: {
			userBloodGas: {
				handler(newVal, oldVal) {
					clearTimeout(this.inputDebounce);
					this.inputDebounce = setTimeout(() => {
						this.updateBloodGas();
					}, 600);
				},
				deep: true,
			},
		},
		methods: {
			editedABG() {
				this.userEditedABG = true;
			},
			generateABG() {
				const genABG = abgGenerators[this.abgGenPick](true)[0];
				this.userBloodGas = genABG;
				this.userEditedABG = false;
			},
			shuffleABG() {
				this.abgGenPick = Object.keys(abgGenerators)[Math.ceil(Math.random() * Object.keys(abgGenerators).length) - 1];
				this.generateABG();
			},
			updateBloodGas() {
				const urlQuery = Object.assign({}, this.userBloodGas.abg);
				// @ts-ignore
				this.$router.replace({query: urlQuery});
				const disturb = this.userBloodGas.guessDisturbances();
				this.results = {
					adjustedPaO2: this.userBloodGas.adjustedPaO2(),
					o2Disturbance: this.userBloodGas.o2Disturbance(),
					pHDisturbance: this.userBloodGas.phDisturbance(),
					realisticABG: this.userBloodGas.realisticABG(),
					pHExpected: this.userBloodGas.pHExpected(),
					serumAnionGap: this.userBloodGas.serumAnionGap(),
					serumDeltaGap: this.userBloodGas.serumDeltaGap(),
					disturbances: disturb,
					expectedCompensation: this.userBloodGas.expectedCompensation(),
					completeCompensation: !disturb.includes(BG.DisturbType.IncompleteComp),
				};
				if (!["pH", "O2", "anionGap", "deltaGap", undefined].includes(this.activeChip)) {
					this.activeChip = undefined;
				}
			},
			decodeURL() {
				let urlData = Object.assign({}, this.$route.query);
				urlData = Object.keys(urlData).reduce((agg: any, key: string): any => {
					if (urlData[key] !== undefined) {
						const numericParsed = parseFloat(urlData[key].toString());
						agg[key] = isNaN(numericParsed) ? urlData[key] : numericParsed;
					}
					return agg;
				}, {});
				Object.assign(this.userBloodGas.abg, urlData);
			},
			activateChipInfo(chipID: string) {
				if (chipID === "Normal") return;
				if (this.activeChip === chipID) {
					this.activeChip = undefined;
					goTo("#info-chips");
					return;
				}
				this.activeChip = chipID;
				goTo("#info-panel-container");
			},
		},
		mounted() {
			this.$nextTick(() => {
				this.decodeURL();
				this.updateBloodGas();
			});
		},
	});
</script>

<style>
	hr{
		margin: 14px 0px;
	}
	.numeric-input{
		max-width: 220px;
		width: 180px;
		margin: 0px 10px !important;
	}
	.numeric-input.primary--text, .numeric-input .primary--text{
		color: #e7ea78 !important;
		caret-color: #e7ea78 !important;
		border-color: #e7ea78 !important;
	}
	#info-chips .v-chip{
		margin: 14px 12px;
	}
	.v-chip--label:hover {
		background-color: #777;
	}
	.v-chip--label .v-chip__content {
		cursor: pointer;
	}
	.v-chip--label .v-avatar{
		border-radius: 2px;
	}
	#info-panel {
		border-radius: 8px;
		background-color: hsla(0, 0%, 16%, 1);
		width: 100%;
		max-width: 1200px;
		margin: auto;
		box-shadow: 0px 0px 5px #202020 inset;
	}
	.instruction-box {
		padding: 10px;
		margin: 10px;
		text-align: center;
		border: 1px dotted white;
		border-radius: 5px;
	}
	.abg-form .v-text-field {
		width: 120px;
	}
	#abggen .user-edited-abg .v-select__selections{
		color: #999 !important;
	}
</style>
