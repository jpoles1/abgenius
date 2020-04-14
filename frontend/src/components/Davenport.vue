<template>
	<div class="davenport-diagram">
		<div style="display: flex; justify-content: center; flex-wrap: wrap; margin-top: 12px;">
			<b>Color Points Using:</b>
			<div class="flex-break" style="margin: 0;"></div>
			<v-select v-model="colorBy" :items="['Generator', 'Genius']" @change="plotDavenport();" style="max-width: 200px; display: inline-block; margin: 5px 15px;"/>
			<v-btn @click="genDiagramData(); plotDavenport();">Regen</v-btn>
			<div class="flex-break" style="margin: 0;"></div>
			<sup><i>Grouping of points should match between genius (calculated disturbances) and generator (actual disturbances).</i></sup>
			<div style="flex-basis: 100%; height: 16px;"></div>
			<div style="transform: scale(0.85); transform-origin: top center;">
				<svg :width="width" :height="height"/>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
	const d3 = Object.assign({},
		require("d3-selection"),
		require("d3-axis"),
		require("d3-scale"),
		require("d3-shape"),
		require("d3-array"),
		require("d3-scale-chromatic"),
	);
	d3.tip = require("d3-tip").default;
	import * as BG from "@/components/BloodGas";
	import { abgGenerators } from "@/components/BloodGasGen";

	import Vue from "vue";
	import { color } from "d3";
	type DavenportDatum = [string, [BG.BloodGas, BG.DisturbType[]]];
	export default Vue.extend({
		data() {
			return {
				colorBy: "Generator",
				refRngs: BG.RefRngs,
				width: 690,
				height: 606,
				padding: {top: 10, right: 30, bottom: 30, left: 60},
				genData: [] as [string, [BG.BloodGas, BG.DisturbType[]]][],
			};
		},
		methods: {
			plotDavenport() {
				const svg = d3.select(this.$el).select("svg");
				d3.selectAll(".davenport-tooltip").remove();
				svg.selectAll("*").remove();
				if (svg === undefined) return;
				const plotArea = svg.append("g");
				plotArea.attr("width", this.width - this.padding.left - this.padding.right)
					.attr("height", this.height - this.padding.top - this.padding.bottom)
					.attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")")
					.attr("class", "davenport-plot-area");
				plotArea.append("defs")
					.append("pattern")
					.attr("id", "davenport-bg")
					.attr("patternUnits", "userSpaceOnUse")
					.attr("width", this.width - this.padding.left - this.padding.right)
					.attr("height", this.height - this.padding.top - this.padding.bottom)
					.append("image")
					.attr("xlink:href", "/img/davenport.png")
					.attr("width", this.width - this.padding.left - this.padding.right)
					.attr("height", this.height - this.padding.top - this.padding.bottom);
				plotArea.append("rect")
					.attr("width", this.width - this.padding.left - this.padding.right)
					.attr("height", this.height - this.padding.top - this.padding.bottom)
					.attr("fill", "url(#davenport-bg)");

				// Add X axis
				const xAxis = d3.scaleLinear()
					.domain([7.0, 7.8])
					.range([ 0, this.width - this.padding.left - this.padding.right ]);
				plotArea.append("g")
					.attr("transform", "translate(0," + (this.height - this.padding.bottom - 10) + ")")
					.call(d3.axisBottom(xAxis));

				// Add Y axis
				const yAxis = (d3.scaleLinear() as any)
					.domain([-0.1, 60])
					.range([this.height - this.padding.top - this.padding.bottom, 0]);
				plotArea.append("g")
					.call(d3.axisLeft().tickValues(Array(16).fill(0).map((_, x) => x * 4)).scale(yAxis));
				// Color scheme
				const colorScale = JSON.parse(JSON.stringify(d3.schemePaired));
				colorScale.push("orange");
				colorScale.push("black");
				// Tooltips
				const tooltip =  d3.tip().attr("class", "davenport-tooltip").html((d: DavenportDatum) => "Actual: " + d[0] + "<br>Genius: " + d[1][0].guessDisturbances());
				plotArea.call(tooltip);
				// Add dots
				const genDisturbList: any = [];
				plotArea.append("g")
					.selectAll("dot")
					.data(this.genData)
					.enter()
					.append("circle")
					.filter((d: DavenportDatum) => {
						return d[1][0].abg.pH! > 7;
					})
					.attr("cx", (d: DavenportDatum) => xAxis(d[1][0].abg.pH!))
					.attr("cy", (d: DavenportDatum) => yAxis(d[1][0].abg.bicarb!))
					.attr("opacity", 0.25)
					.attr("r", 4.5)
					.on("mouseover", tooltip.show)
					.on("mouseout", tooltip.hide)
					.style("fill", (d: DavenportDatum) => {
						if (this.colorBy === "Generator") {
							return colorScale[Object.keys(abgGenerators).indexOf(d[0])];
						}
						if (this.colorBy === "Genius") {
							const name = JSON.stringify(d[1][0].guessDisturbances());
							if (genDisturbList.indexOf(name) === -1) {
								genDisturbList.push(name);
							}
							return colorScale[genDisturbList.indexOf(name)];
						}
						return "black";
					});
			},
			genDiagramData() {
				const nPoints = 500;
				const selectedGenerators = [
					"Normal",
					"Uncompensated Respiratory Acidosis", "Compensated Respiratory Acidosis",
					"Uncompensated Respiratory Alkalosis", "Compensated Respiratory Alkalosis",
					"Compensated Metabolic Acidosis", "Compensated Metabolic Alkalosis",
					"Uncompensated Metabolic Acidosis", "Uncompensated Metabolic Alkalosis",
					"Compensated Anion Gap Metabolic Acidosis", "Uncompensated Anion Gap Metabolic Acidosis",
					"Anion Gap Metabolic Acidosis + Respiratory Acidosis", "Metabolic Acidosis + Respiratory Acidosis",
					"Metabolic Alkalosis + Respiratory Alkalosis",
					//"Compensated Positive Delta Gap", "Uncompensated Positive Delta Gap",
					//"Compensated Negative Delta Gap", "Uncompensated Negative Delta Gap",
				];
				this.genData = selectedGenerators.reduce((agg, genName) => {
				//this.genData = Object.keys(abgGenerators).reduce((agg, genName) => {
					const gen = abgGenerators[genName];
					Array(nPoints).fill(0).forEach((_) => {
						agg.push([genName, gen(false)]);
					});
					return agg;
				}, [] as [string, [BG.BloodGas, BG.DisturbType[]]][]);
			},
		},
		mounted() {
			this.$nextTick(() => {
				this.genDiagramData();
				this.plotDavenport();
			});
		},
	});
</script>

<style>
	.davenport-tooltip {
		min-width: 40px;
		max-width: 160px;
		padding: 5px;
		border-radius: 4px;
		min-height: 20px;
		text-align: center;
		background-color: #ccc;
		font-family: sans-serif;
	}
</style>