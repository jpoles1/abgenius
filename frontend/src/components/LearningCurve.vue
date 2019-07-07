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
			plotWidth: {
				type: Number,
				default: 380,
			},
			plotHeight: {
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
				if (this.answerData.length === 0) return;
				const plotData = this.generateWindows();
				const svg = d3.select(this.$el).select("svg");
				svg.selectAll("*").remove();
				if (svg === undefined) return;
				const margin = {
								top: 20,
								right: 30,
								bottom: 60,
								left: 45,
							};
				const width = this.plotWidth;
				const height = this.plotHeight;
				svg.attr("width", width).attr("height", height);
				const xScale = d3.scaleLinear()
				.domain([0.5, plotData.length + 5])
				.range([margin.left, width - margin.right]);
				const yScale = d3.scaleLinear()
				.domain([0, 100])
				.range([height - margin.bottom, margin.top]);
				/*const tooltip = d3.tip().attr('class', 'd3-tip').html(function(d: number) {
					return "<center>Rolling Avg. Accuracy:<br>"+d+"</center>";
				}).direction('s').offset([-(height-margin.top-15), -(width-margin.left)/4]);*/
				const plotarea = svg.append("g")
					.attr("width", width - margin.left - margin.right)
					.attr("height", height - margin.top - margin.bottom);
				plotarea.append("rect")
					.attr("width", width - margin.left - margin.right)
					.attr("height", height - margin.top - margin.bottom)
					.attr("transform", "translate(" + margin.left + ", " + margin.top * 2 + ")")
					.attr("fill", "#767da9");
				const xAxis = d3.axisBottom().scale(xScale);
				const yAxis = d3.axisLeft().scale(yScale);
				plotarea.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0, " + (height - margin.top * 2) + ")")
					.call(xAxis);
				plotarea.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
					.call(yAxis);
				// Plot Title
				plotarea.append("text").text("Learning Curve")
					.attr("x", width / 2)
					.attr("y", margin.top + 10)
					.style("text-anchor", "middle").attr("fill", "white")
					.style("font-weight", "bold").style("font-size", "110%");
				// Axis labels
				svg.append("text").text("Case Window #")
					.attr("x", width / 2)
					.attr("y", height)
					.style("text-anchor", "middle").attr("fill", "white")
					.style("font-weight", "bold").style("font-size", "100%");
				svg.append("text").text("% Accuracy")
					.attr("x", 10)
					.attr("y", height / 2)
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
				plotarea.append("path")
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
				plotarea.selectAll("circle").data(plotData).enter().append("circle")
					.attr("cx", (d: number, i: number) => xScale(i + 1))
					.attr("cy", (d: number) => yScale(d))
					.attr("r", 5)
					.style("fill", "#57068C")
					.attr("val", (d: number) => d);
				/*const vertLine = plotarea.append("line")
					.attr({'x1': 0, 'y1': 0, 'x2': 0,'y2': height})
					.attr("class", "d3line")*/
				/*let lastVal = undefined as string | undefined;
				var getPlotVal = function(){
					var xpos = Math.round(xScale.invert(d3.mouse(this)[0]));
					var val = plotData[xpos-1] ? plotData[xpos-1].toFixed(2) : undefined;
					if(val){
						vertLine.attr("transform", "translate("+xScale(xpos)+", 0)").style("stroke", "red")
						tooltip.show(val)
						//$("#infoarea").html("<h3 style='margin: auto'>Grade for Window #"+xpos+" = "+val+"<br><br><i>(Window size="+WINDOW_SIZE+")</i></h3>")
					}
					else{
						tooltip.hide(lastVal)
					}
					lastVal = val;
				}
				plotarea.append("rect").attr("width", width- margin.left - margin.right)
					.attr("height", height - margin.top - margin.bottom)
					.style("fill-opacity", .2)
					.call(tooltip)
					.on("mousemove", getPlotVal).on("mouseout", function() {
						tooltip.hide(lastVal)
					});*/
			},
		},
	});
</script>
