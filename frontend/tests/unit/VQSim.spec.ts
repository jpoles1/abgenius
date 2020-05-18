import { VQSim } from "@/components/VQSim";
import { vqPresets } from "@/components/VQPresets";

describe("Predetermined Results", () => {
	test("Normal Lung", () => {
		const sim = new VQSim(vqPresets[0]);
		sim.run_sim();
		expect(sim.results.a_pH.toFixed(2)).toBe((7.39).toFixed(2));
		expect(sim.results.pa_o2.toFixed(2)).toBe((94.74).toFixed(2));
		expect(sim.results.pa_co2.toFixed(2)).toBe((41.02).toFixed(2));
		expect(sim.results.art_o2_con.toFixed(2)).toBe((20.53).toFixed(2));
		expect(sim.results.art_co2_con.toFixed(2)).toBe((47.88).toFixed(2));
		expect(sim.results.hgb_sat.toFixed(2)).toBe((97.11).toFixed(2));
		expect(sim.results.deadspace_pct.toFixed(2)).toBe((29.67).toFixed(2));
		expect(sim.results.venous_admixture_pct.toFixed(2)).toBe((1.69).toFixed(2));
		expect(sim.results.resp_quotient.toFixed(2)).toBe((0.8).toFixed(2));
	});
	test("Bronchial Obstruction", () => {
		const sim = new VQSim(vqPresets[3]);
		sim.run_sim();
		expect(sim.results.a_pH.toFixed(2)).toBe((7.39).toFixed(2));
		expect(sim.results.pa_o2.toFixed(2)).toBe((55.34).toFixed(2));
		expect(sim.results.pa_co2.toFixed(2)).toBe((43.3).toFixed(2));
		expect(sim.results.art_o2_con.toFixed(2)).toBe((18.52).toFixed(2));
		expect(sim.results.art_co2_con.toFixed(2)).toBe((49.51).toFixed(2));
		expect(sim.results.hgb_sat.toFixed(2)).toBe((88.38).toFixed(2));
		expect(sim.results.deadspace_pct.toFixed(2)).toBe((29.74).toFixed(2));
		expect(sim.results.venous_admixture_pct.toFixed(2)).toBe((27.5).toFixed(2));
		expect(sim.results.resp_quotient.toFixed(2)).toBe((0.8).toFixed(2));
	});
});
