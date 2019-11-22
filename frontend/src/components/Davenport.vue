<template>
	<div class="davenport-diagram">
		<svg :width="width" :height="height"/>
		<v-btn @click="genDiagramData(); plotDavenport();">Regen</v-btn>
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
	type DavenportDatum = [string, [BG.BloodGas, BG.DisturbType[][]]];
	export default Vue.extend({
		props: {
			activeChip: String,
			abg: Object,
			results: Object,
		},
		data() {
			return {
				refRngs: BG.RefRngs,
				width: 690,
				height: 606,
				padding: {top: 10, right: 30, bottom: 30, left: 60},
				genData: [] as [string, [BG.BloodGas, BG.DisturbType[][]]][],
			};
		},
		methods: {
			plotDavenport() {
				const svg = d3.select(this.$el).select("svg");
				d3.selectAll(".d3-tip").remove();
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
				const yAxis = d3.scaleLinear()
					.domain([0, 60])
					.range([this.height - this.padding.top - this.padding.bottom, 0]);
				plotArea.append("g")
					.call(d3.axisLeft(yAxis));
				// Color scheme
				const colorScale = JSON.parse(JSON.stringify(d3.schemePaired));
				colorScale.push("orange");
				colorScale.push("black");
				// Tooltips
				const tooltip =  d3.tip().attr("class", "d3-tip").html((d: DavenportDatum) => d[0]);
				plotArea.call(tooltip);
				// Add dots
				console.log(Object.keys(abgGenerators).length);
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
					.attr("opacity", 0.5)
					.attr("r", 4.5)
					.on("mouseover", tooltip.show)
					.on("mouseout", tooltip.hide)
					.style("fill", (d: DavenportDatum) => colorScale[Object.keys(abgGenerators).indexOf(d[0])]);
			},
			genDiagramData() {
				const nPoints = 500;
				const selectedGenerators = ["Normal", 
					"Acute Respiratory Acidosis", "Chronic Respiratory Acidosis",
					"Acute Respiratory Alkalosis", "Chronic Respiratory Alkalosis",
					"Compensated Metabolic Acidosis", "Compensated Metabolic Alkalosis",
				];
				this.genData = selectedGenerators.reduce((agg, genName) => {
					const gen = abgGenerators[genName];
					Array(nPoints).fill(0).forEach((_) => {
						agg.push([genName, gen()]);
					});
					return agg;
				}, [] as [string, [BG.BloodGas, BG.DisturbType[][]]][]);
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
	.davenport-diagram .d3-tip {
		width: 140px;
		background-color: white;
	}
</style>