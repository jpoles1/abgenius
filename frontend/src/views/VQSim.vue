<template>
	<div style="padding: 15px; max-width: 1400px; margin: auto; text-align: center;">
		<h1 style="">Pulmonary Gas Exchange Simulator</h1>
		<div style="display: flex; flex-wrap: wrap; justify-content: center; margin-top: 30px">
			<!--<div v-for="(data, field) in inputData" :key="field" style="text-align: left; margin-bottom: 14px; border-radius: 4px;">
				<span style="font-size: 80%;">&nbsp;&nbsp;&nbsp;{{ data.label }}</span>
				<br />
				<input type="number" v-model.number="sim[field]" class="sim-input" :min="data.range[0]" :max="data.range[1]" outlined @input="inputUpdated" style="border: 1px solid white; border-radius: 4px; padding: 6px; width: 160px;" />
			</div>-->
			<v-text-field v-for="(data, field) in inputData" :key="field" type="number" v-model.number="sim[field]" class="sim-input" :min="data.range[0]" :max="data.range[1]" outline @input="inputUpdated(1000)">
				<template slot="label">
					{{ data.label }}
				</template>
			</v-text-field>
		</div>
		<v-label>
			VQ Preset:
		</v-label>
		<v-select label="VQ Preset" solo :items="preset_items" v-model="vq_preset" style="width: 400px; margin: auto; text-align: center" @input="inputUpdated(150)" />
		<span v-show="simPending">
			<v-btn @click="runSim" class="mb-2">
				<b>Run</b>
			</v-btn>
			&nbsp;&nbsp;&nbsp;
		</span>
		<v-btn @click="resetSim" class="mb-2">
			<b>Reset</b>
		</v-btn>
		<hr style="margin: 20px;" />
		<div v-show="invalidInputs.length > 0" style="color: red; margin-bottom: 20px; font-weight: bold;">
			<span style="font-size: 120%;">
				WARNING: The following settings may be incompatible with life, simulation results may be inaccurate.
			</span>
			<br />
			<div style="display: flex; justify-content: center; max-width: 60%; margin: auto;">
				<div v-for="invalid in invalidInputs" :key="invalid" style="margin: 10px; background-color: #ffbdbd; border: 2px solid red; padding: 8px; border-radius: 4px;">
					{{ inputData[invalid].label }}
					<br />
					Range = {{ inputData[invalid].range[0] }} to {{ inputData[invalid].range[1] }}
				</div>
			</div>
		</div>
		<div style="display: flex; justify-content: space-around;">
			<v-card style="padding: 12px;">
				<h2 style="margin-bottom: 12px;">VQ Zones</h2>
				<v-divider/>
				<vqview :vq="sim.alveoli.map(x => Math.abs(Math.log(100 * Math.abs(1 - x.v_pct / x.q_pct) + 0.00001)))" :width="460" :height="380" />
			</v-card>
			<!-- prettier-ignore -->
			<v-card width="480" style="padding: 12px;"> 
				<h2 style="margin-bottom: 12px;">Compartment Values</h2>
				<v-divider/>
				<div>
					<div class="result-row">
						<span class="output-label">Final pH:</span>
						<span class="align-end">{{ sim.results.a_pH.toFixed(2) }}</span>
					</div>
					<div class="result-row">
						<span class="output-label">Arterial P<sub>A</sub> O<sub>2</sub>:</span>
						<span class="align-end">{{ sim.results.pa_o2.toFixed(2) }} torr</span>
					</div>
					<div class="result-row">
						<span class="output-label">Arterial P<sub>A</sub> CO<sub>2</sub>:</span>
						<span class="align-end">{{ sim.results.pa_co2.toFixed(2) }} torr</span>
					</div>
					<div class="result-row">
						<span class="output-label">Arterial O<sub>2</sub> Concentration:</span>
						<span class="align-end">{{ sim.results.art_o2_con.toFixed(2) }} mL/L of blood</span>
					</div>
					<div class="result-row">
						<span class="output-label">Arterial CO<sub>2</sub> Concentration:</span>
						<span class="align-end">{{ sim.results.art_co2_con.toFixed(2) }} mL/L of blood</span>
					</div>
					<div class="result-row">
						<span class="output-label">Hemoglobin Saturation:</span>
						<span class="align-end">{{ sim.results.hgb_sat.toFixed(2) }}%</span>
					</div>
					<div class="result-row">
						<span class="output-label">Total Dead Space:</span>
						<span class="align-end">{{ sim.results.deadspace_pct.toFixed(2) }}%</span>
					</div>
					<div class="result-row">
						<span class="output-label">Venous Admixture:</span>
						<span class="align-end">{{ sim.results.venous_admixture_pct.toFixed(2) }}%</span>
					</div>
					<div class="result-row">
						<span class="output-label">Overall R:</span>
						<span class="align-end">{{ sim.results.resp_quotient.toFixed(2) }}</span>
					</div>
					<br>
					<a :href="abgURL" target="blank" style="color: white; font-size: 110%;" v-show="invalidInputs.length === 0">
						Generate ABG from results
					</a>
				</div>
			</v-card>
		</div>
	</div>
</template>

<script lang="ts">
import { VQSim } from "@/components/VQSim";
import vqview from "@/components/VQView.vue";
import { RefRngs } from "@/components/BloodGas";
import { randFloat } from "@/components/BloodGasGen";
import Vue from "vue";
import { vqPresets } from "@/components/VQPresets";

export default Vue.extend({
	components: {
		vqview,
	},
	data() {
		return {
			simPending: false,
			vq_preset: 0,
			preset_items: vqPresets.map((x, i) => {
				return { text: x.name, value: i };
			}),
			sim: new VQSim(vqPresets[0]),
			inputTimeout: undefined as number | undefined,
			inputData: {
				resp_rate: {
					label: "Resp. Rate (breaths/min)",
					range: [4, 40],
				},
				tidal_vol: {
					label: "Tidal Volume (mL/breath)",
					range: [150, 2000],
				},
				cardiac_output: {
					label: "Cardiac Output (L/min)",
					range: [2, 20],
				},
				fi_o2: {
					label: "FiO2",
					range: [0.21, 1],
					enforceRange: true,
				},
				hgb: {
					label: "Hemoglobin (g/dl)",
					range: [5, 20],
				},
				v_o2: {
					label: "VO2 (mL/min)",
					range: [150, 900],
				},
				v_co2: {
					label: "VCO2 (mL/min)",
					range: [120, 900],
				},
				atm_press: {
					label: "Atmospheric Pressure (torr)",
					range: [425, 3025],
				},
				temp: {
					label: "Body Temperature (°C)",
					range: [30, 44],
					enforceRange: true,
				},
			},
		};
	},
	watch: {
		vq_preset() {
			this.sim = new VQSim(vqPresets[this.vq_preset]);
		},
	},
	methods: {
		cleanInputs() {
			Object.keys(this.inputData).forEach((fieldName) => {
				if ((this.inputData as any)[fieldName].enforceRange) {
					if ((this.sim as any)[fieldName] < (this.inputData as any)[fieldName].range[0]) {
						this.$set(this.sim, fieldName, (this.inputData as any)[fieldName].range[0]);
					} else if ((this.sim as any)[fieldName] > (this.inputData as any)[fieldName].range[1]) {
						this.$set(this.sim, fieldName, (this.inputData as any)[fieldName].range[1]);
					}
				}
			});
		},
		inputUpdated(delay = 1000) {
			this.simPending = true;
			clearTimeout(this.inputTimeout);
			this.inputTimeout = setTimeout(() => {
				this.runSim();
			}, delay);
		},
		runSim() {
			this.cleanInputs();
			this.simPending = false;
			this.sim.run_sim();
		},
		resetSim() {
			this.vq_preset = 0;
			this.sim = new VQSim(vqPresets[this.vq_preset]);
			this.sim.run_sim();
		},
	},
	computed: {
		calcBicarb(): number {
			return 3 * this.sim.results.pa_co2! * Math.pow(10, this.sim.results.a_pH! - (81 / 10));
		},
		abgURL(): string {
			const Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper,  0);
			const Cl = randFloat(
				Na - (RefRngs.AnionGap!.upper - 1 + this.calcBicarb),
				Na - (RefRngs.AnionGap!.lower + 1 + this.calcBicarb),
				0,
			);
			return `/?pH=${this.sim.results.a_pH.toFixed(2)}&PaCO2=${this.sim.results.pa_co2.toFixed(0)}&bicarb=${this.calcBicarb.toFixed(0)}&Na=${Na}&Cl=${Cl}`;
		},
		invalidInputs(): string[] {
			return Object.keys(this.inputData).reduce(
				(agg, fieldName) => {
					if ((this.sim as any)[fieldName] < (this.inputData as any)[fieldName].range[0] || (this.sim as any)[fieldName] > (this.inputData as any)[fieldName].range[1]) {
						agg.push(fieldName);
					}
					return agg;
				},
				[] as string[],
			);
		},
	},
	mounted() {
		this.$nextTick(() => {
			// Run the simulation using the default parameters once everything is loaded in.
			this.runSim();
		});
	},
});
</script>

<style scoped>
.sim-input {
	width: 180px;
	max-width: 180px;
	margin: 0 8px !important;
}
.flex-break {
	width: 100%;
	height: 1px;
}
span.output-label {
	text-align: left;
}
.result-row {
	display: flex;
	justify-content: space-between;
	font-size: 125%;
	margin-top: 6px;
	margin-bottom: 6px;
	border-bottom: 1px solid #ddd;
}
</style>
