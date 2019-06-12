<template>
	<v-container>
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
		<v-btn color="primary" @click="randomizeABG">
			Randomize
		</v-btn>
		<v-btn color="primary" @click="generateABG">
			Generate
		</v-btn>
		<v-select v-model="abgGenPick" :items="abgGenOptions" style="width: 250px;"/>
		{{results.disturbances}}
		<hr>
		<v-layout wrap justify-space-around id="info-chips">
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
			<v-chip v-for="(disturb, disturbIndex) in results.disturbances" :key="disturbIndex">
				<v-avatar class="warning" v-if='!["Normal", "Unknown"].includes(disturb[0])'>
					<v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(disturb[0])'>
						fa-wind
					</v-icon>
					<v-icon small v-else-if='["Metabolic Acidosis", "Metabolic Alkalosis"].includes(disturb[0])'>
						fa-vial
					</v-icon>
				</v-avatar>
				<v-avatar class="success" v-if="disturb[0] == 'Normal'">        
					<v-icon small>fas fa-check</v-icon>
				</v-avatar>
				<div v-if="disturb[0] == 'Normal'">
					No Acid Base Disorder
				</div>
				<div v-else>
					{{disturb[1]}} {{disturb[0]}}
				</div>
			</v-chip>
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
				<v-avatar class="error" v-if="results.serumDeltaGap.disturb == 'Anion Gap'">        
					<v-icon>fas fa-arrows-alt-h</v-icon>
				</v-avatar>
				<v-avatar class="success" v-if="results.serumDeltaGap.disturb == 'Normal'">        
					<v-icon small>fas fa-check</v-icon>
				</v-avatar>
				<b>Delta Gap:</b>&nbsp; {{results.serumDeltaGap.gap.toFixed(1)}}
			</v-chip>
		</v-layout>
		<hr>
		<CalcInfoPanel :activeChip="activeChip" :abg="userBloodGas.abg" :results="results"/>
		<br>
		<ReferenceList/>
	</v-container>
</template>

<script lang="ts">
	import * as BG from "./BloodGas";
	import { abgGenerators, generateRandABG } from "./BloodGasGen";
	import CalcInfoPanel from "./CalcInfoPanel.vue";
	import ReferenceList from "./ReferenceList.vue";

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
				userBloodGas: new BG.BloodGas({
					abg: {
						patientAge: undefined,
						pH: BG.RefRngMidpoint("apH"),
						bicarb: BG.RefRngMidpoint("aBicarb"),
						PaCO2: BG.RefRngMidpoint("PaCO2"),
						PaO2: BG.RefRngMidpoint("PaO2"),
						Na: BG.RefRngMidpoint("Na"),
						K: BG.RefRngMidpoint("K"),
						Cl: BG.RefRngMidpoint("Cl"),
						Albumin: undefined, // BG.RefRngMidpoint("Albumin"),
						Lactate: 0.6,
					},
				}),
				results: {
					serumAnionGap: {gap: NaN, disturb: BG.DisturbType.Unknown} as BG.Gap,
					serumDeltaGap: {gap: NaN, disturb: BG.DisturbType.Unknown} as BG.Gap,
					adjustedPaO2: {lower: 80, upper: 100} as BG.RefRange,
					pHExpected: 7.4,
					realisticABG: true,
					o2Disturbance: BG.DisturbType.Normal,
					pHDisturbance: BG.DisturbType.Normal,
					disturbances: [[BG.DisturbType.Unknown]] as BG.DisturbType[][],
					tertiaryDisturbance: BG.DisturbType.Unknown,
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
			randomizeABG() {
				const randABG = generateRandABG();
				this.userBloodGas = randABG[0];
			},
			generateABG() {
				const genABG = abgGenerators[this.abgGenPick]()[0];
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
					tertiaryDisturbance: BG.DisturbType.Unknown,
				};
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
				if (this.activeChip === chipID) {
					this.activeChip = undefined;
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

<style scpped>
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
</style>
