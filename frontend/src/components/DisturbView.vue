<template>
	<div v-if="disturb[0] == 'Metabolic Acidosis'">
		<div v-if="disturb[1] == 'Anion Gap'">

		</div>
		<div v-else-if="disturb[1] == 'Hyperchloremic'">
			<h1>Hyperchloremic Metabolic Acidosis</h1>
			<b>HARDUP</b>
			Hyperchloraemia
			Acetazolamide, Addison’s disease
			Renal tubular acidosis
			Diarrhoea, ileostomies, fistulae
			Ureteroenterostomies
			Pancreatoenterostomies
		</div>
	</div>
	<div v-else-if="disturb[0] == 'Metabolic Alkalosis'">

	</div>
	<div v-else-if="disturb[0] == 'Metabolic Alkalosis'">

	</div>
	<div v-else-if="disturb[0] == 'Metabolic Alkalosis'">

	</div>
</template>

<script lang="ts">
import Vue from "vue";
import * as BG from "@/components/BloodGas";

export default Vue.extend({
	props: {
		disturb: Array,
	},
});
</script>
