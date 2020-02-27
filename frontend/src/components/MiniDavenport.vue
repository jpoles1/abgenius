<template>
	<center>
		<h3>Davenport Diagram</h3>
		<div style="width: 363px; height: 390px;">
			<div class="mini-davenport-diagram" style="transform: scale(0.6); transform-origin: top left; margin-left: -30px;">
				<svg :width="width" :height="height"/>
			</div>	
		</div>
	</center>
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

	import Vue from "vue";
	import { color } from "d3";
	type DavenportDatum = [string, [BG.BloodGas, BG.DisturbType[]]];
	export default Vue.extend({
		props: {
			answerData: {
				type: Object as () => BG.ABGAnswer,
			},
		},
		data() {
			return {
				debounce: undefined as number | undefined,
				width: 690,
				height: 606,
				padding: {top: 10, right: 30, bottom: 30, left: 60},
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
					.data([this.answerData])
					.enter()
					.append("circle")
					.attr("cx", (d: BG.BloodGas) => xAxis(d.abg.pH!))
					.attr("cy", (d: BG.BloodGas) => yAxis(d.abg.bicarb!))
					.attr("r", 10)
					.on("mouseover", tooltip.show)
					.on("mouseout", tooltip.hide)
					.style("fill", "orange")
					.attr("stroke", "black")
					.attr("stroke-width", "2px");
			},
		},
		watch: {
			answerData: {
				deep: true,
				handler() {
					clearTimeout(this.debounce);
					this.debounce = setTimeout(() => {
						this.plotDavenport();
					}, 600);
				},
			},
		},
		mounted() {
			this.$nextTick(() => {
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