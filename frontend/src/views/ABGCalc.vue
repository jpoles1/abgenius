<template>
	<v-container>
		<headful
			title="ABGenius - Calculator"
		/>
		<v-form v-model="validABG">
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
			<center><h2>Arterial Blood Gas</h2></center><br>
			<v-layout text-xs-center wrap justify-center>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field
								v-model.number="userBloodGas.abg.pH" 
								type="number" label='Serum pH'
								outline class="numeric-input" step="0.01"
								min="6" max="14"
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
								min="0"
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
								min="0"
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
								min="0"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + results.adjustedPaO2.lower + " - " + results.adjustedPaO2.upper + ")"}}
					</span>
				</v-tooltip>
			</v-layout>
			<center><h2>Electrolytes</h2></center><br>
			<v-layout text-xs-center wrap justify-center>
				 <v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field
								v-model.number="userBloodGas.abg.Na" 
								type="number" label='Serum Sodium'
								outline class="numeric-input" step="0.5"
								min="0"
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
								min="0"
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
								min="0"
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
								min="0"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.aLactate.lower + " - " + refRngs.aLactate.upper + ")"}}
					</span>
				</v-tooltip>
			</v-layout>
		</v-form>
		<hr>
		<v-layout wrap justify-center id="info-chips">
			<v-chip @click="activateChipInfo('O2')" v-if="showPaO2">
				<v-avatar class="error" v-if="results.o2Disturbance != 'Normal'">        
					<v-icon v-if="results.o2Disturbance == 'Hyperoxemia'">fas fa-arrow-up</v-icon>
					<v-icon v-if="results.o2Disturbance == 'Hypoxemia'">fas fa-arrow-down</v-icon>
				</v-avatar>
				<v-avatar class="success" v-else>        
					<v-icon small>fas fa-check</v-icon>
				</v-avatar>
				<b>Blood Oxygen:</b>&nbsp;{{results.o2Disturbance}}
			</v-chip>
			<div class="instruction-box">
				<b>Step 1: Assess Overall Blood pH</b>
				<br>
				<v-chip @click="activateChipInfo('pH')" v-if="!results.realisticABG">
					<v-avatar class="error">        
						<v-icon>fas fa-question</v-icon>
					</v-avatar>
					<b>Check ABG</b>
				</v-chip>
				<v-chip @click="activateChipInfo('pH')">
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
				<v-chip v-if="results.serumAnionGap.disturb != undefined" @click="activateChipInfo('anionGap')">
					<v-avatar class="error" v-if="results.serumAnionGap.disturb == 'Anion Gap'">        
						<v-icon>fas fa-arrows-alt-h</v-icon>
					</v-avatar>
					<v-avatar class="success" v-if="results.serumAnionGap.disturb == 'Normal'">        
						<v-icon small>fas fa-check</v-icon>
					</v-avatar>
					<b>Anion Gap:</b>&nbsp; {{results.serumAnionGap.gap.toFixed(1)}}
				</v-chip>
				<v-chip v-if="results.serumDeltaGap.disturb != undefined && results.serumAnionGap.disturb == 'Anion Gap'" @click="activateChipInfo('deltaGap')">
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
				<v-chip  @click="activateChipInfo('anionGap')">
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
				<v-chip  @click="activateChipInfo('deltaGap')">
					<v-avatar class="warning">
						<v-icon small>
							fa-vial
						</v-icon>
					</v-avatar>
					<div>						
						{{results.disturbances[1][0]}}
					</div>
				</v-chip>
			</div>
			<div class="instruction-box" v-if="results.serumAnionGap.disturb == 'Anion Gap' && results.serumDeltaGap.disturb == 'Delta Gap'">
				<b>Step 5: Add Respiratory Disturbances</b>
				<br>
				<v-chip @click="activateChipInfo(results.disturbances[2][0])">
						<v-avatar class="warning" v-if="results.disturbances[2] && ['Respiratory Acidosis', 'Respiratory Alkalosis'].includes(results.disturbances[2][0])">
							<v-icon small>
								fa-wind
							</v-icon>
						</v-avatar>
						<v-avatar class="warning" v-else>
							<v-icon small>fas fa-not-equal</v-icon>
						</v-avatar>
						<div v-if="results.disturbances[2] && ['Respiratory Acidosis', 'Respiratory Alkalosis'].includes(results.disturbances[2][0])">
							{{results.disturbances[2][0]}}
						</div>
						<div v-else>
							None
						</div>
				</v-chip>
			</div>
			<div class="instruction-box" v-if="results.serumAnionGap.disturb !== 'Anion Gap'">
				<b>Step 3: Check Primary Disturbance</b>
				<br>
				<v-chip @click="activateChipInfo(results.primaryDisturb[0])">
					<v-avatar class="warning" v-if="results.primaryDisturb">
						<v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(results.primaryDisturb[0])'>
							fa-wind
						</v-icon>
						<v-icon small v-else-if='["Metabolic Acidosis", "Metabolic Alkalosis"].includes(results.primaryDisturb[0])'>
							fa-vial
						</v-icon>
					</v-avatar>
					<v-avatar class="success" v-else>        
						<v-icon small>fas fa-check</v-icon>
					</v-avatar>
					<div v-if="results.primaryDisturb">
						{{results.primaryDisturb[0]}}
					</div>
					<div v-else>
						None
					</div>
				</v-chip>
			</div>
			<div class="instruction-box" v-if="(results.serumDeltaGap.disturb !== 'Delta Gap' || results.serumDeltaGap.disturb !== 'Anion Gap') && results.primaryDisturb">
				<b>Step 4: Check For Compensation</b>
				<br>
				<v-chip @click="activateChipInfo(results.compensatoryDisturb[0])">
					<v-avatar class="warning" v-if="results.compensatoryDisturb">
						<v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(results.compensatoryDisturb[0])'>
							fa-wind
						</v-icon>
						<v-icon small v-else-if='["Metabolic Acidosis", "Metabolic Alkalosis"].includes(results.compensatoryDisturb[0])'>
							fa-vial
						</v-icon>
					</v-avatar>
					<v-avatar class="warning" v-else>        
						<v-icon small>fas fa-not-equal</v-icon>
					</v-avatar>
					<div v-if="results.compensatoryDisturb">
						{{results.compensatoryDisturb[0]}}
					</div>
					<div v-else>
						None
					</div>
				</v-chip>
			</div>
		</v-layout>
		<hr>
		<transition name="infos" mode="out-in">
			<CalcInfoPanel id="info-panel" v-if="activeChip !== undefined" :activeChip="activeChip" :abg="userBloodGas.abg" :results="results"/>
		</transition>
		<br>
		<v-expansion-panel>
			<v-expansion-panel-content>
				<template v-slot:header>
					<div>Auto-Generate ABG</div>
				</template>
				<v-card style="padding: 20px; box-shadow: 0px 0px 5px #202020 inset !important;">
					<center>
						<v-select v-model="abgGenPick" :items="abgGenOptions" style="width: 380px; max-width: 100%;"/>
						<br>
						<v-btn color="primary" @click="generateABG">
							Generate
						</v-btn>
					</center>
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
	import ReferenceList from "@/components/ReferenceList.vue";

	import Vue from "vue";
	import goTo from "vuetify/lib/components/Vuetify/goTo";
	export default Vue.extend({
		components: {
			CalcInfoPanel,
			ReferenceList,
		},
		data() {
			return {
				abgGenPick: Object.keys(abgGenerators)[0],
				abgGenOptions: Object.keys(abgGenerators),
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
					disturbances: [[BG.DisturbType.Unknown]] as BG.DisturbType[][],
					primaryDisturb: undefined as BG.DisturbType[] | undefined,
					compensatoryDisturb: undefined as BG.DisturbType[] | undefined,
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
			generateABG() {
				const genABG = abgGenerators[this.abgGenPick](true)[0];
				this.userBloodGas = genABG;
			},
			updateBloodGas() {
				const urlQuery = Object.assign({}, this.userBloodGas.abg);
				// @ts-ignore
				this.$router.replace({query: urlQuery});
				this.results = {
					adjustedPaO2: this.userBloodGas.adjustedPaO2(),
					o2Disturbance: this.userBloodGas.o2Disturbance(),
					pHDisturbance: this.userBloodGas.phDisturbance(),
					realisticABG: this.userBloodGas.realisticABG(),
					disturbances: this.userBloodGas.guessDisturbances(),
					pHExpected: this.userBloodGas.pHExpected(),
					serumAnionGap: this.userBloodGas.serumAnionGap(),
					serumDeltaGap: this.userBloodGas.serumDeltaGap(),
					primaryDisturb: this.userBloodGas.guessPrimaryDisturbance(),
					compensatoryDisturb: this.userBloodGas.guessCompensation(),
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
				goTo("#info-chips");
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
	#info-panel {
		border-radius: 8px;
		background-color: hsla(0, 0%, 16%, 1);
		padding: 20px;
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
</style>
