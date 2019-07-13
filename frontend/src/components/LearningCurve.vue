<template>
	<div>
		<svg id="learning-curve-container">
		</svg>
	</div>
</template>

<script lang="ts">
	import * as BG from "@/components/BloodGas";
	const d3 = Object.assign({},
		require("d3-selection"),
		require("d3-axis"),
		require("d3-scale"),
		require("d3-shape"),
		require("d3-array"),
	);
	d3.tip = require("d3-tip").default;
	import Vue from "vue";
	export default Vue.extend({
		props: {
			answerData: {
				type: Array as () => BG.ABGAnswer[],
			},
			windowSize: {
				type: Number,
				default: 10,
			},
			width: {
				type: Number,
				default: 380,
			},
			height: {
				type: Number,
				default: 220,
			},
		},
		watch: {
			answerData() {
				this.drawLearningCurve();
			},
		},
		mounted() {
			this.$nextTick(function() {
				this.drawLearningCurve();
			});
		},
		methods: {
			generateWindows(): number[] {
				const windowData = [];
				const nWindows = Math.max(this.answerData.length - this.windowSize, 1);
				// Generates proportion correct for each window
				let i = 0;
				while (i < nWindows) {
					const windowedAnswers = this.answerData.slice(i, i + this.windowSize);
					const gradeSum = windowedAnswers.reduce((prev, curr) => prev + curr.grade, 0);
					windowData.push(gradeSum / windowedAnswers.length);
					i++;
				}
				return windowData;
			},
			drawLearningCurve() {
				if (!this.answerData || this.answerData.length === 0) return;
				const plotData = this.generateWindows();
				const svg = d3.select(this.$el).select("svg");
				svg.selectAll("*").remove();
				if (svg === undefined) return;
				const margin = {
					top: 40,
					right: 30,
					bottom: 60,
					left: 45,
				};
				const width = this.width;
				const plotWidth = width - margin.left - margin.right;
				const height = this.height;
				const plotHeight = height - margin.top - margin.bottom;
				svg.attr("width", width).attr("height", height);
				const xScale = d3.scaleLinear()
				.domain([0.5, plotData.length + 5])
				.range([margin.left, width - margin.right]);
				const yScale = d3.scaleLinear()
				.domain([0, 100])
				.range([height - margin.bottom, margin.top]);
				// Tooltips
				const tooltip = d3.tip().attr("class", "d3-tip").html((d: number) => {
					return "<center>Rolling Avg. Accuracy:<br>" + d + "%</center>";
				}).direction("s").offset([-(height - margin.top - margin.bottom), -(width - margin.left - 40) / 4]);
				const plotarea = svg.append("g")
					.attr("class", "plotarea")
					.attr("width", plotWidth)
					.attr("height", plotHeight)
					.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
				plotarea.append("rect")
					.attr("width", plotWidth)
					.attr("height", plotHeight)
					.attr("fill", "#767da9");
				const xAxis = d3.axisBottom().scale(xScale);
				const yAxis = d3.axisLeft().scale(yScale);
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0, " + (height - margin.bottom) + ")")
					.call(xAxis);
				svg.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + margin.left + ", 0)")
					.call(yAxis);
				// Plot Title
				svg.append("text").text("Learning Curve")
					.attr("x", width / 2)
					.attr("y", margin.top - 10)
					.style("text-anchor", "middle").attr("fill", "white")
					.style("font-weight", "bold").style("font-size", "110%");
				// Axis labels
				svg.append("text").text("Case Window #")
					.attr("x", width / 2)
					.attr("y", height - margin.bottom + 36)
					.style("text-anchor", "middle").attr("fill", "white")
					.style("font-weight", "bold").style("font-size", "100%");
				svg.append("text").text("% Accuracy")
					.attr("x", 10)
					.attr("y", ((height - margin.bottom - margin.top) / 2) + margin.top)
					.style("text-anchor", "middle").attr("fill", "white")
					.style("font-weight", "bold").style("font-size", "100%")
					.attr("transform", function(this: any, d: any) {
						const w = +d3.select(this).attr("x");
						const h = +d3.select(this).attr("y");
						return("rotate(-90, " + w + ", " + h + ")");
					});
				const learningCurve = d3.line()
					.x((d: number, i: number) => xScale(i + 1))
					.y((d: number) => yScale(d));
				svg.append("path")
					.datum(plotData)
					.attr("class", "d3line bold").style("stroke", "#57068C")
					.attr("fill", "none")
					.attr("d", learningCurve);
				/*if(learning_data.cohort_vals){
					for(cohort_user_ind in window_data.cohort_vals){
						var cohort_user = window_data.cohort_vals[cohort_user_ind];
						plotarea.append("path")
							.datum(cohort_user)
							.attr("class", "d3line").style("stroke", "black")
							.attr("d", line);
					}
				}*/
				svg.selectAll("circle").data(plotData).enter().append("circle")
					.attr("cx", (d: number, i: number) => xScale(i + 1))
					.attr("cy", (d: number) => yScale(d))
					.attr("r", 4)
					.style("fill", "#57068C")
					.attr("val", (d: number) => d);
				const vertLine = svg.append("line")
					.attr("x1", 0).attr("y1", margin.top)
					.attr("x2", 0).attr("y2", height - margin.bottom);
				let lastVal = undefined as string | undefined;
				const getPlotVal = function(this: any) {
					const xpos = Math.round(xScale.invert(d3.mouse(this)[0] + margin.left));
					const val = plotData[xpos - 1] !== undefined ? plotData[xpos - 1].toFixed(2) : undefined;
					if (val !== undefined) {
						vertLine.attr("transform", "translate(" + xScale(xpos) + ", 0)")
						.style("stroke", "#3d4057").style("stroke-width", "2px");
						tooltip.show(val, this);
					} else {
						tooltip.hide(lastVal);
						vertLine.style("stroke", "none");
					}
					lastVal = val;
				};
				plotarea.append("rect")
					.attr("width", plotWidth)
					.attr("height", plotHeight)
					.style("fill-opacity", 0)
					.call(tooltip)
					.on("mousemove", getPlotVal);
			},
		},
	});
</script>
