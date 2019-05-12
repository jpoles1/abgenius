<template>
    <div id="gamblegram">
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as d3 from "d3";
import * as BG from "./BloodGas";

interface Ion {
    name: string;
    value: number;
    offset?: number;
    color: string;
}

export default Vue.extend({
    props: {
        abg: Object,
        results: Object,
    },
    data() {
        return {
            width: 440,
            height: 340,
        };
    },
    methods: {
        drawGamblegram() {
            // set the dimensions and margins of the graph
            const margin = {top: 40, right: 30, bottom: 20, left: 50};
            const width = this.width - margin.left - margin.right;
            const height = this.height - margin.top - margin.bottom;
            // Color palatte: http://paletton.com/#uid=75o0T0kllllaFw0g0qFqFg0w0aF
            const ionData = {
                "Anions": [
                    {name: "Na⁺", value: this.abg.Na, color: "#27556C"},
                    {name: "Other", value: this.abg.K, color: "#032536"},
                ],
                "Cations": [
                    {name: "Cl⁻", value: this.abg.Cl, color: "#BD5E7D"},
                    {name: "HCO3⁻", value: this.abg.bicarb, color: "#973253"},
                    {name: "Albumin", value: this.abg.Albumin * 2.5, color: "#711331"},
                ],
            } as  {[id: string]: Ion[]};
            const ionSums = {} as {[id: string]: number};
            const plotData = Object.keys(ionData).reduce((agg: any, ionCat: string) => {
                ionSums[ionCat] = 0;
                agg[ionCat] = ionData[ionCat].map((ion: any) => {
                    ion.offset = ionSums[ionCat];
                    ionSums[ionCat] += ion.value;
                    return ion;
                });
                return agg;
            }, {});
            const colMax = Math.max(...Object.values(ionSums));
            Object.keys(ionSums).forEach((ionCat) => {
                if (ionSums[ionCat] < colMax) {
                    plotData[ionCat].push({name: ionCat.slice(0, -1) + " Gap", value: colMax - ionSums[ionCat], offset: ionSums[ionCat], color: "#AA7539"});
                }
            });
            // clear div
            d3.select("#gamblegram").selectAll("*").remove();
            // append the svg object to the body of the page
            const svg = d3.select("#gamblegram")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
            // Add title
            svg.append("text")
                .attr("x", (width / 2) + margin.left)
                .attr("y", 30)
                .style("text-anchor", "middle")
                .text("Gamblegram")
                .attr("fill", "white")
                .attr("font-size", "16px");
            const plotContainer  = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .attr("width", width)
                    .attr("height", height);
            // Add background
            /*svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("x", 0)
                .attr("y", 0)
                .attr("fill", "#ddd");*/
             // Add X axis
            const x = d3.scaleBand()
                .domain(Object.keys(plotData))
                .range([0, width])
                .padding(0.2);
            plotContainer.append("g")
                .attr("transform", "translate(0," + height + ")")
                .style("font-size", "14px")
                .call(d3.axisBottom(x).tickSizeOuter(0));
            // Add Y axis
            const y = d3.scaleLinear()
                .domain([0, colMax + 10])
                .range([height, 0]);
            plotContainer.append("g")
                .style("font-size", "12px")
                .call(d3.axisLeft(y));
            // Add Bars
            const barContainer = plotContainer.append("g")
                .selectAll("g")
                // Enter in the stack data = loop key per key = group per group
                .data(Object.keys(plotData))
                .enter().append("g")
                .attr("transform", (d: any) => "translate(" + x(d) + ", 0)")
                .selectAll("rect")
                // enter a second time = loop subgroup per subgroup to add all rectangles
                .data((d) => plotData[d].filter((x: any) => x.value > 0).map((ion: any) => Object.assign(ion, {"grp": d})))
                .enter();
            barContainer.append("rect")
                .attr("x", 0)
                .attr("y", (d: any) => y(d.value + d.offset))
                .attr("height", (d: any) => height - y(d.value))
                .attr("fill", (d: any) => d.color)
                .attr("width", x.bandwidth());
            barContainer.append("text")
                .attr("fill", "white")
                .attr("x", x.bandwidth() / 2)
                .attr("y", (d: any) => y(d.offset + (d.value / 2) - 2))
                .text((d: any) => "[" + d.name + "] = " + d.value.toFixed(1))
                .style("text-anchor", "middle")
                .style("font-size", "8pt")
                .on("mouseover", function(d) {
                    d3.select(this).style("font-size", "10pt");
                })
                .on("mouseout", function(d) {
                    d3.select(this).style("font-size", "8pt");
                });
        },
    },
    watch: {
        abg: {
            deep: true,
            handler() {
                this.drawGamblegram();
            },
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.drawGamblegram();
        });
    },
});
</script>