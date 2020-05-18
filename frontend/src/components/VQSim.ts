// Copyright 1997 - 2020 New York University - All Rights Reserved
/*
 *
 * Converted from Fortran code
 * Conversion by Marc Waldman
 * https://home.manhattan.edu/~marc.waldman/research.htm
 *
 * Converted from ancient Javascript to modern Javascript
 * Conversion by Jordan Poles
 * https://jpoles1.com/
 *
 */

/* tslint:disable:variable-name */

import * as fmin from "fmin";

const MAX_ITER = 2000;

import { vqPresets, VQPreset } from "@/components/VQPresets";

export interface Alveolus {
	/** Ventilation */
	v_pct: number;
	/** Perfusion */
	q_pct: number;
}

interface SimResults {
	total_vent: number;
	a_pH: number; // pH of arterial blood
	pa_o2: number; // Partial pressure of O2 in arterial blood
	pa_co2: number; // Partial pressure of CO2 in arterial blood
	art_o2_con: number; // Oxygen content in arterial blood
	art_co2_con: number; // Carbon dioxide content in arterial blood
	hgb_sat: number; // Hemoglobin saturation
	shunt_pct: number; // % of cardiac output shunted
	deadspace_pct: number;
	venous_admixture_pct: number;
	resp_quotient: number;
	ideal_vaq: number;
}

export class VQSim {
	// SIM STATE

	/** Stores the state of discrete alveoli */
	public alveoli: Alveolus[];
	public results: SimResults;

	// PHYSICAL CONSTANTS

	/** Ambient temperature in °C */
	public temp: number;
	/** Atmospheric pressure */
	public atm_press: number;
	/** Calculation tolerance */
	public tolerance: number;
	// PATIENT CHARACTERISTICS

	/** Cardiac output in L/min */
	public cardiac_output: number;
	/** Blood hemoglobin concentration */
	public hgb: number;
	/** Blood hematocrit (estimated from hemoglobin) */
	public hcrit: number;
	/** Rate of oxygen consumption (due to metabolism) in mL/min */
	public v_o2: number;
	/** Rate of oxygen consumption (due to metabolism) in mL/min */
	public v_co2: number;
	/** Amount by which the p50 of patient's blood exceeds the p50 of the standard dissociation curve */
	public dp50: number;
	/** Volume of anatomic deadspace accounting for airways in mL */
	public anatomic_deadspace_airways: number;
	/** Percentage of tidal volume otherwise lost as deadspace */
	public tv_deadspace_pct: number;

	// VENTILATOR SETTINGS

	/** Respiratory rate */
	public resp_rate: number;
	/** Tidal volume */
	public tidal_vol: number;
	/** Fraction of O2 in inspired air */
	public fi_o2: number;
	/** Partial pressre of O2 in inspired air */
	public pi_o2: number;
	/** Fraction of CO2 in inspired air */
	public fi_co2: number;
	/** Partial pressre of CO2 in inspired air */
	public pi_co2: number;
	/** Partial pressure of nitrogen in mixed venous blood */
	public pv_n2: number;

	constructor(preset: VQPreset, resp_rate = 16, tidal_vol = 450, fi_o2 = 0.21) {
		// PHYSICAL CONSTANTS
		this.temp = 37;
		this.atm_press = 760;
		this.tolerance = 2;
		// PATIENT CHARACTERISTICS
		this.cardiac_output = 5.4;
		this.hgb = 15;
		this.hcrit = this.hgb * 3;
		this.v_o2 = 300;
		this.v_co2 = 240;
		this.dp50 = 26.8;
		this.anatomic_deadspace_airways = 100;
		// VENTILATOR SETTINGS
		this.resp_rate = resp_rate;
		this.tidal_vol = tidal_vol;
		this.fi_o2 = fi_o2;
		this.pi_o2 = this.fi_o2 * (this.atm_press - 47.0);
		this.pi_co2 = 0;
		this.fi_co2 = this.pi_co2 / (this.atm_press - 47.0);
		this.pv_n2 = this.atm_press - 47 - this.pi_o2 - this.pi_co2;
		// SIM STATE
		this.alveoli = preset.vqZones.map((a) => {
			return {v_pct: a[0], q_pct: a[1]} as Alveolus;
		});
		this.alveoli.shift();
		this.tv_deadspace_pct = preset.tvDeadspacePct;
		this.results = {
			total_vent: 0,
			a_pH: 0,
			pa_o2: 0,
			pa_co2: 0,
			art_o2_con: 0,
			art_co2_con: 0,
			hgb_sat: 0,
			shunt_pct: 0,
			deadspace_pct: 0,
			venous_admixture_pct: 0,
			resp_quotient: 0,
			ideal_vaq: 0,
		};
	}
	public run_sim() {
		// Regenerate computed sim params
		this.pi_o2 = this.fi_o2 * (this.atm_press - 47.0);
		this.pi_co2 = 0;
		this.fi_co2 = this.pi_co2 / (this.atm_press - 47.0);
		this.pv_n2 = this.atm_press - 47 - this.pi_o2 - this.pi_co2;
		// Calculate total ventilation
		this.results.total_vent = this.resp_rate * (this.tidal_vol / 1000 - (this.anatomic_deadspace_airways / 1000 + ((this.tv_deadspace_pct / 100) * this.tidal_vol) / 1000));
		let shunt = 0;
		// Assign compartment values based on percents
		const vq_total = this.alveoli.map((a: Alveolus) => {
			const v = (a.v_pct / 100) * this.results.total_vent;
			const q = (a.q_pct / 100) * this.cardiac_output;
			const vq = q === 0 ? 1000 : v / q;
			if (v === 0) shunt += q;
			return { v, q, vq };
		});
		//Shunt as pct of cardiac output
		this.results.shunt_pct = (100 * shunt) / this.cardiac_output;
		this.find_mvp();
	}
	public pureo2(FMVO2: Readonly<number>, FMVCO2: Readonly<number>, GVAQ: Readonly<number>): any {
		//TODO: Probably all wrong here... redo this
		let pureo2_loop = true; // initialization required

		const TOL1 = 0.001;
		let R1 = 0;
		let PCO21 = this.pi_co2;
		let PCO22X = this.pi_co2 + this.pi_o2;
		let pa_o2 = 0;
		let pa_co2 = 0;
		let o2_con = 0;
		let co2_con = 0;
		let FVQ = 0;
		while (pureo2_loop) {
			// simulate goto 10 line after label 20,30
			pa_co2 = (PCO21 + PCO22X) / 2.0;
			pa_o2 = this.pi_o2 + this.pi_co2 - pa_co2;
			[o2_con, co2_con] = this.blood(pa_o2, pa_co2);
			R1 = (o2_con - FMVO2) / (FMVCO2 - co2_con);
			const CON1 = 1.0 + this.fi_co2 * (R1 - 1.0);
			FVQ = (8.63 * (FMVCO2 - co2_con) * CON1) / (pa_co2 - this.pi_co2);
			const DIFF = Math.abs(GVAQ - FVQ);
			if (DIFF > TOL1) {
				//changed the DIFF .LE. TOL1 to
				//simulate action of goto
				// simulate the arithmetic if on line before label 20
				if (GVAQ - FVQ < 0) {
					PCO21 = pa_co2;
				} else if (GVAQ - FVQ === 0) {
					pureo2_loop = false;
				} else if (GVAQ - FVQ > 0) {
					PCO22X = pa_co2;
				}
			} else pureo2_loop = false;
		}
		const RZ = 1.0 / R1;
		return [pa_o2, pa_co2, o2_con, co2_con, FVQ, RZ];
	}
	public grad_desc_vqsoln(pmv_o2: Readonly<number>, pmv_co2: Readonly<number>, o2_con: Readonly<number>, co2_con: Readonly<number>, comp_vq: Readonly<number>) {
		const ALPHA = 0.0017;
		const loss = (X: [number, number]) => {
			const trial_pmv_o2 = X[0];
			const trial_pmv_co2 = X[1];
			let [O2CON1, CCO21] = [0, 0];
			const [trial_o2_con, trial_co2_con] = this.blood(trial_pmv_o2, trial_pmv_co2);
			if (this.pv_n2 !== 0.0) {
				const RZ = (co2_con - trial_co2_con) / (trial_o2_con - o2_con);
				const FAO2 = pmv_o2 / (this.atm_press - 47.0);
				const FACO2 = pmv_co2 / (this.atm_press - 47.0);
				const FVN2 = this.pv_n2 / (this.atm_press - 47.0);
				const C1 = 1.0 - FAO2 - FACO2;
				const C2 = C1 - FVN2;
				const C3 = 1.0 - this.fi_o2 - this.fi_co2;
				const B1 = (comp_vq * C1) / C3;
				const B2 = (8.63 * ALPHA * C2) / C3;
				O2CON1 = o2_con + (this.pi_o2 * (B1 + B2) - trial_pmv_o2 * comp_vq) / 8.63;
				CCO21 = co2_con - (trial_pmv_co2 * comp_vq - this.pi_co2 * (B1 + B2)) / 8.63;
			} else {
				// this.pv_n2 is equal to 0.0 - Code is from label 50 - 60
				//N2 EXCHANGE IGNORED - fortran code comment
				const ABAB = trial_pmv_co2 * (1.0 - this.fi_o2) - this.fi_co2 * (this.atm_press - 47.0 - trial_pmv_o2);
				const AAAA = (ABAB * comp_vq) / (8.63 * (1.0 - this.fi_o2 - this.fi_co2));
				const BBAA = this.pi_o2 - trial_pmv_o2 * (1.0 - this.fi_co2) - this.fi_o2 * trial_pmv_co2;
				const AABB = trial_pmv_co2 * (1.0 - this.fi_o2) - this.pi_co2 + this.fi_co2 * trial_pmv_o2;
				const RZ = AABB / BBAA;
				O2CON1 = o2_con + AAAA / RZ;
				CCO21 = co2_con - AAAA;
			}
			const o2_loss = Math.abs(trial_o2_con - O2CON1);
			const co2_loss = Math.abs(trial_co2_con - CCO21);
			const neg_loss = pmv_o2 < 0 || pmv_co2 < 0 ? 1000 : 0;
			return o2_loss + co2_loss + neg_loss;
		};
		const solution = fmin.nelderMead(loss, [40, 45]).x;
		const search_pmv_o2 = solution[0];
		const search_pmv_co2 = solution[1];
		const [search_o2_con, search_co2_con] = this.blood(search_pmv_o2, search_pmv_co2);
		return [search_pmv_o2, search_pmv_co2, search_o2_con, search_co2_con];
	}
	/**
	 *
	 * @param pmv_o2 Partial pressure of O2 in mixed venous blood sample
	 * @param pmv_co2 Partial pressure of CO2 in mixed venous blood sample
	 * @param o2_con O2 content in mixed venous blood sample
	 * @param co2_con CO2 content in mixed venous blood sample
	 * @param comp_vq VQ ratio for a given gas exchange compartment
	 */
	public vqsoln(pmv_o2: Readonly<number>, pmv_co2: Readonly<number>, o2_con: Readonly<number>, co2_con: Readonly<number>, comp_vq: Readonly<number>): any {
		let O2CON1;
		let CCO21;
		let NFLAG; //local variable not same as global NFLAG array
		let DET1;
		let DET2;
		let broke_out_of_for_loop = false; // used to simulate the goto out of
		// the for loop starting at label 40
		// and ending at label 90
		let outer_while_loop = true; // used to simulate goto on label 210
		let inner_while_loop = true; // used to simulate goto right before
		// label 190
		let J;

		let U = new Array(5);
		const F = new Array(5);
		const G = new Array(5);

		const TOL1 = 0.001;
		const ALPHA = 0.0017;
		// Use rules to create 3 pairs of boundary values for mixed venous oxygen and co2 partial pressures
		// Used to define our field of search for the algorithm used below
		let pmv_o2_opts: number[];
		let pmv_co2_opts: number[];
		if (comp_vq <= 0.55) {
			pmv_o2_opts = [pmv_o2 + 0.1, pmv_o2 + 0.1, pmv_o2 + 10.0];
			pmv_co2_opts = [pmv_co2, pmv_co2 + 5.0, pmv_co2];
		} else if (comp_vq >= 10.0) {
			pmv_co2_opts = [0.2 + this.pi_co2, (8.63 * o2_con) / comp_vq + this.pi_co2, (8.63 * o2_con) / comp_vq + this.pi_co2];
			pmv_o2_opts = [(this.pi_o2 - this.fi_o2 * pmv_co2_opts[0]) / (1.0 - this.fi_co2) - 0.1, (this.pi_o2 - this.fi_o2 * pmv_co2_opts[1]) / (1.0 - this.fi_co2) - 0.1, (this.pi_o2 - this.fi_o2 * pmv_co2_opts[0]) / (1.0 - this.fi_co2) - 0.1];
		} else {
			const PIVOT = (this.pi_o2 + pmv_o2) / 2.0;
			pmv_o2_opts = [PIVOT, PIVOT + 20.0, PIVOT];
			pmv_co2_opts = [10, 40, 40];
		}
		let ITER = 0;
		let NNN = 3;
		let search_o2_con = 0;
		let search_co2_con = 0;
		let search_pmv_o2 = 0;
		let search_pmv_co2 = 0;
		let FVQ = 0;
		let RZ = 0;
		while (outer_while_loop) {
			for (let N = 0; N < NNN; N++) {
				search_pmv_o2 = pmv_o2_opts[N];
				search_pmv_co2 = pmv_co2_opts[N];
				[search_o2_con, search_co2_con] = this.blood(search_pmv_o2, search_pmv_co2);
				// If N2 is present in venous blood
				if (this.pv_n2 !== 0.0) {
					RZ = (co2_con - search_co2_con) / (search_o2_con - o2_con);
					const FAO2 = search_pmv_o2 / (this.atm_press - 47.0);
					const FACO2 = search_pmv_co2 / (this.atm_press - 47.0);
					const FVN2 = this.pv_n2 / (this.atm_press - 47.0);
					const C1 = 1.0 - FAO2 - FACO2;
					const C2 = C1 - FVN2;
					const C3 = 1.0 - this.fi_o2 - this.fi_co2;
					const B1 = (comp_vq * C1) / C3;
					const B2 = (8.63 * ALPHA * C2) / C3;
					O2CON1 = o2_con + (this.pi_o2 * (B1 + B2) - search_pmv_o2 * comp_vq) / 8.63;
					CCO21 = co2_con - (search_pmv_co2 * comp_vq - this.pi_co2 * (B1 + B2)) / 8.63;
				} else {
					// this.pv_n2 is equal to 0.0 - Code is from label 50 - 60
					//N2 EXCHANGE IGNORED - fortran code comment
					const ABAB = pmv_co2_opts[N] * (1.0 - this.fi_o2) - this.fi_co2 * (this.atm_press - 47.0 - pmv_o2_opts[N]);
					const AAAA = (ABAB * comp_vq) / (8.63 * (1.0 - this.fi_o2 - this.fi_co2));
					const BBAA = this.pi_o2 - pmv_o2_opts[N] * (1.0 - this.fi_co2) - this.fi_o2 * pmv_co2_opts[N];
					const AABB = pmv_co2_opts[N] * (1.0 - this.fi_o2) - this.pi_co2 + this.fi_co2 * pmv_o2_opts[N];
					RZ = AABB / BBAA;
					O2CON1 = o2_con + AAAA / RZ;
					CCO21 = co2_con - AAAA;
				}
				F[N] = search_o2_con - O2CON1;
				G[N] = search_co2_con - CCO21;
				if (Math.abs(F[N]) - TOL1 <= 0) {
					//simulating arithmetic if
					if (Math.abs(G[N]) - TOL1 <= 0) {
						search_pmv_o2 = pmv_o2_opts[N];
						search_pmv_co2 = pmv_co2_opts[N];
						broke_out_of_for_loop = true;
						outer_while_loop = false;
						break;
					}
				}
			}
			if (broke_out_of_for_loop) {
				if (this.pi_co2 <= 0.0) {
					// changing GT 0.0 logic to avoid goto 230
					FVQ = (8.63 * (co2_con - search_co2_con)) / search_pmv_co2;
				} else {
					const D1 = (search_o2_con - o2_con) / this.pi_o2 + (co2_con - search_co2_con) / this.pi_co2;
					const D2 = search_pmv_co2 / this.pi_co2 - search_pmv_o2 / this.pi_o2;
					FVQ = (8.63 * D1) / D2;
				}

				return [search_pmv_o2, search_pmv_co2, search_o2_con, search_co2_con, FVQ, RZ];
			} else {
				// broke_out_of_for_loop=false
				U = Array(3)
					.fill(0)
					.map((_: any, i: number) => 1);
				DET1 = this.determ(U, F, G);
				U = Array(3)
					.fill(0)
					.map((_: any, i: number) => pmv_o2_opts[i]);
				NFLAG = 0;
				inner_while_loop = true;
				while (inner_while_loop) {
					DET2 = this.determ(U, F, G);
					if (NFLAG - 1 < 0) pmv_o2_opts[3] = DET2 / DET1;
					else pmv_co2_opts[3] = DET2 / DET1;
					if (NFLAG - 1 < 0) {
						for (let N = 0; N < 3; N++) U[N] = pmv_co2_opts[N];
						NFLAG = 1;
					} else {
						inner_while_loop = false;
					}
				}
				for (let N = 0; N < 2; N++) {
					J = 2 - N;
					pmv_o2_opts[J] = pmv_o2_opts[J - 1];
					pmv_co2_opts[J] = pmv_co2_opts[J - 1];
					F[J] = F[J - 1];
					G[J] = G[J - 1];
				}
				pmv_o2_opts[0] = pmv_o2_opts[3];
				pmv_co2_opts[0] = pmv_co2_opts[3];
				NNN = 1;
				ITER = ITER + 1;
				if (ITER - 20 >= 0) {
					outer_while_loop = false;
					// repeat of code if (broke_out_of_while_loop)
					if (this.pi_co2 <= 0.0) {
						//
						FVQ = (8.63 * (co2_con - search_co2_con)) / search_pmv_co2;
					} else {
						const D1 = (search_o2_con - o2_con) / this.pi_o2 + (co2_con - search_co2_con) / this.pi_co2;
						const D2 = search_pmv_co2 / this.pi_co2 - search_pmv_o2 / this.pi_o2;
						FVQ = (8.63 * D1) / D2;
					}
					return [search_pmv_o2, search_pmv_co2, search_o2_con, search_co2_con, FVQ, RZ];
				}
			}
		}
	}

	/**
	Kelman's procedure for modeling the CO2 dissociation curve
	@param p_co2 Partial pressure of CO2 in blood sample
	@param pH pH of blood sample
	@param hgb_sat Hemoglobin saturation in blood sample
	@returns Total carbon dioxide content (plasma + cellular) in a blood sample
	*/
	public kelman_co2_content(p_co2: Readonly<number>, pH: Readonly<number>, hgb_sat: Readonly<number>): number {
		const P = 7.4 - pH;
		const PK = 6.086 + 0.042 * P + (38.0 - this.temp) * (0.00472 + 0.00139 * P); // pK value of CO2 dissolution in blood plasma
		const SOL = 0.0307 + 0.00057 * (37.0 - this.temp) + 0.00002 * (37.0 - this.temp) * (37.0 - this.temp); // solubility of CO2 in blood plasma
		const DOX = 0.59 + 0.2913 * P - 0.0844 * P * P; // Ratio of cellular : plasma CO2 content in fully oxygenated blood (per paper by van Slyke and Sendroy)
		const DR = 0.664 + 0.2275 * P - 0.0938 * P * P; // Ratio of cellular : plasma CO2 content in fully "reduced" blood (per paper by van Slyke and Sendroy)
		const DDD = DOX + (DR - DOX) * (1 - hgb_sat / 100.0);
		const CP = SOL * p_co2 * (1.0 + Math.pow(10.0, pH - PK)); // Total plasma CO2 content (using Henderson-Hasselbalch)
		const CCC = DDD * CP; // Total cellular CO2 content
		return (this.hcrit * CCC * 0.01 + (1.0 - this.hcrit * 0.01) * CP) * 2.22; // Total blood CO2 content
	}
	/**
	Kelman's procedure for calculating hemoglobin saturation using the O2 dissociation curve
	@param p_o2 Partial pressure of CO2 in blood sample
	@param p_co2 Partial pressure of CO2 in blood sample
	@param pH pH of blood sample
	@returns Hemoglobin saturation in a blood sample
	*/
	public kelman_hgb_sat(p_o2: Readonly<number>, p_co2: Readonly<number>, pH: Readonly<number>): number {
		const A1 = -8532.229;
		const A2 = 2121.401;
		const A3 = -67.07399;
		const A4 = 935960.9;
		const A5 = -31346.26;
		const A6 = 2396.167;
		const A7 = -67.10441;
		const B = 0.43429 * Math.log(40.0 / p_co2);
		let X = p_o2 * Math.pow(10.0, 0.024 * (37.0 - this.temp) + 0.4 * (pH - 7.4) + 0.06 * B);
		X = (this.dp50 * X) / this.dp50;
		if (X - 10.0 < 0) return 0.3683 * X + 0.0584 * X * X;
		else return (100.0 * (X * (X * (X * (X + A3) + A2) + A1))) / (X * (X * (X * (X + A7) + A6) + A5) + A4);
	}
	/**
	 * Kelman's procedure for calculating pH of blood sample
	 * @param p_co2 Partial pressure of CO2 in blood sample
	 * @param Y Constant from ....
	 * @returns Calculated pH of blood sample
	 */
	public kelman_pH(p_co2: Readonly<number>, Y: Readonly<number>): number {
		// Constants for points taken from a CO2 vs pH curve (unknown source, likely experimentally derived)
		const APH = 7.48;
		const APCO2 = 30.0;
		const BPH = 7.28;
		const BPCO2 = 60.0;

		if (APH - 1.0 <= 0) return 7.59 + Y - 0.2741 * Math.log(p_co2 / 20.0);
		else return BPH + Y + ((APH - BPH) * Math.log(p_co2 / BPCO2)) / Math.log(APCO2 / BPCO2);
	}

	public blood(p_o2: Readonly<number>, p_co2: Readonly<number>): [number, number, number, number] {
		if (p_co2 <= 0.001) p_co2 = 0.001;
		let Y = 0;
		const pH1 = this.kelman_pH(p_co2, Y);
		Y = 0.003 * this.hgb * (1.0 - this.kelman_hgb_sat(p_o2, p_co2, pH1) / 100.0);
		const pH2 = this.kelman_pH(p_co2, Y);
		const hgb_sat = this.kelman_hgb_sat(p_o2, p_co2, pH2);
		const o2_con = 0.0139 * this.hgb * hgb_sat + 0.003 * p_o2;
		const co2_con = this.kelman_co2_content(p_co2, pH2, hgb_sat);
		return [o2_con, co2_con, hgb_sat, pH2];
	}
	/**
	 * Finds the O2 uptake and CO2 output of the lung for a given mixed venous point
	 * @param pmv_o2 Partial pressure of oxygen in a mixed venous blood sample
	 * @param pmv_co2 Partial pressure of carbon dioxide in a mixed venous blood sample
	 */
	public sumup(pmv_o2: number, pmv_co2: number): any {
		let RNPC;
		let PCLO;
		let PCHI;
		let DPC;
		let RET;
		let SUM;

		const NPC = 50;
		const NPC1 = NPC - 1;
		const PC = new Array();
		const R = new Array();
		const E = new Array();
		RNPC = NPC1;
		PCLO = 0.001;
		PCHI = 1000;
		DPC = Math.log(PCHI / PCLO) / RNPC;
		for (let J = 0; J < NPC; J++) {
			R[J] = 0.0;
			E[J] = 0.0;
			PC[J] = PCLO * Math.exp(DPC * (J - 1.0));
		}
		const [mv_o2_con, mv_co2_con, _] = this.blood(pmv_o2, pmv_co2);
		const vq_total = this.alveoli.map((a: Alveolus) => {
			const v = (a.v_pct / 100) * this.results.total_vent;
			const q = (a.q_pct / 100) * this.cardiac_output;
			const vq = q === 0 ? 1000 : v / q;
			return { v, q, vq };
		});
		const VQ = vq_total.map((a: any) => a.vq);
		const V = vq_total.map((a: any) => a.v);
		const Q = vq_total.map((a: any) => a.q);

		let CC = 0;
		let DD = 0;
		const PO22 = [];
		const PCO22 = [];
		const PN22 = [];
		const RZZ = [];
		const OO2CON = [];
		const OCCO2 = [];
		let [pa_o2, pa_co2, search_o2_con, search_co2_con] = [0, 0, 0, 0];
		for (let I = 0; I < VQ.length; I++) {
			const comp_vq = VQ[I];
			for (let J = 0; J < NPC; J++) {
				RET = PC[J] / (PC[J] + VQ[I]);
				if (VQ[I] > 500.0) RET = 0.0;
				R[J] = R[J] + (RET * Q[I]) / this.cardiac_output;
				E[J] = E[J] + (RET * V[I]) / this.results.total_vent;
			}
			const FI = this.fi_o2 + this.fi_co2;
			SUM = Math.abs(FI - 1.0);
			if (SUM <= 0.0001) {
				// body of label 30 in this block
				[pa_o2, pa_co2, search_o2_con, search_co2_con] = this.pureo2(mv_o2_con, mv_co2_con, comp_vq);
			} else {
				[pa_o2, pa_co2, search_o2_con, search_co2_con] = this.vqsoln(pmv_o2, pmv_co2, mv_o2_con, mv_co2_con, comp_vq);
			}
			if (comp_vq === 0.0) {
				// code from label 999 to label 998
				PO22[I] = pmv_o2;
				PCO22[I] = pmv_co2;
				PN22[I] = this.pi_o2 / this.fi_o2 - pmv_o2 - pmv_co2;
				RZZ[I] = 0.0;
				OO2CON[I] = mv_o2_con;
				OCCO2[I] = mv_co2_con;
			} else if (comp_vq > 500.0) {
				// although else isn't explicit in fortran code
				// there is a logical else because of the goto 50
				// code from label 998 to label 50
				PO22[I] = this.pi_o2;
				PCO22[I] = this.pi_co2;
				PN22[I] = this.pi_o2 / this.fi_o2 - this.pi_o2 - this.pi_co2;
				OO2CON[I] = 0.0;
				OCCO2[I] = 0.0;
			} else {
				// although else isn't explicit in fortran code
				// there is a logical else because of the gotos
				// in the previous lines
				PO22[I] = pa_o2;
				PCO22[I] = pa_co2;
				PN22[I] = this.pi_o2 / this.fi_o2 - pa_o2 - pa_co2; //TODO: double check this line
				OO2CON[I] = search_o2_con;
				OCCO2[I] = search_co2_con;
				CC = CC + search_o2_con * Q[I];
				DD = DD + search_co2_con * Q[I];
			}
		}
		const QR = this.cardiac_output * (1.0 - this.results.shunt_pct / 100.0);
		const art_o2_con = (CC + (this.cardiac_output - QR) * mv_o2_con) / this.cardiac_output;
		const art_co2_con = (DD + (this.cardiac_output - QR) * mv_co2_con) / this.cardiac_output;
		const v_o2 = 10.0 * this.cardiac_output * (art_o2_con - mv_o2_con);
		const v_co2 = 10.0 * this.cardiac_output * (mv_co2_con - art_co2_con);
		// the following should be the last statement since returning
		// the values back to calling program
		return [pa_o2, pa_co2, art_o2_con, art_co2_con, mv_o2_con, mv_co2_con, v_o2, v_co2, PO22, PCO22, PN22];
	}
	public determ(U: number[], F: number[], G: number[]) {
		const W = new Array(4);
		let I = 0;
		let J = 1;
		let K = 2;
		let nIter = 0;
		while (true) {
			W[I] = U[I] * (F[J] * G[K] - F[K] * G[J]);
			// if (confirm("W[I]="+W[I]+" "+U[I]+" "+F[J]+" "+G[K]+" "+F[K]+" "+G[J])) return 1;
			if (I - 2 < 0) {
				if (I <= 0) {
					I = 1;
					J = 2;
					K = 0;
				} else {
					I = 2;
					J = 0;
					K = 1;
				}
			} else break;
			if (nIter > MAX_ITER) {
				alert("Failure to converge in subroutine `determ`, results may be inaccurate");
				break;
			}
			nIter++;
		}
		let DDD = 0.0;
		for (let Q = 0; Q < 3; Q++) DDD = DDD + W[Q];
		return DDD;
	}
	public grad_desc_mvp(): [number, number] {
		const loss = (X: [number, number]) => {
			const pmv_o2 = X[0];
			const pmv_co2 = X[1];
			const [pa_o2, pa_co2, art_o2_con, art_co2_con, mv_o2_con, mv_co2_con, v_o2, v_co2, PO22, PCO22, PN22] = this.sumup(pmv_o2, pmv_co2);
			const o2_loss = Math.abs(v_o2 - this.v_o2);
			const co2_loss = Math.abs(v_co2 - this.v_co2);
			const neg_loss = pmv_o2 < 0 || pmv_co2 < 0 ? 1000 : 0;
			return o2_loss + co2_loss + neg_loss;
		};
		const solution = fmin.nelderMead(loss, [40, 45]);
		return (solution as any).x;
	}
	/**
	 * Use a regula falsi optimization algorithm in order to find a set of mixed venous gas contents
	 */
	public find_mvp() {
		const [pmv_o2, pmv_co2] = this.grad_desc_mvp();
		const [pa_o2, pa_co2, art_o2_con, art_co2_con, _mv_o2_con, _mv_co2_con, v_o2, v_co2, PO22, PCO22, PN22] = this.sumup(pmv_o2, pmv_co2);
		const [mv_o2_con, mv_co2_con] = this.blood(pmv_o2, pmv_co2);
		let PAN2 = 0.0;
		const Q = this.alveoli.map((a) => a.q_pct * this.cardiac_output);
		for (let I = 1; I <= this.alveoli.length; I++) {
			PAN2 = PAN2 + Q[I] * PN22[I];
		}
		const QR = this.cardiac_output * (1.0 - this.results.shunt_pct / 100.0);
		PAN2 = this.pv_n2 * (1.0 - QR / this.cardiac_output) + PAN2 / this.cardiac_output;
		const ALPHA = 0.0017;
		const CAN2 = ALPHA * PAN2;
		const CVN2 = ALPHA * this.pv_n2;
		const VN2 = 10.0 * this.cardiac_output * (CAN2 - CVN2); // N2 Uptake (mL/min)
		this.summary(pmv_o2, pmv_co2, mv_o2_con, mv_co2_con, art_o2_con, art_co2_con, v_o2, v_co2, PO22, PCO22, PN22);
		return;
	}
	/**
	 *
	 * @param pa_co2 Partial pressure of CO2 in blood sample
	 * @param art_o2_con Calculated Arterial O2 content
	 */
	public sameo2(pa_co2: Readonly<number>, art_o2_con: Readonly<number>): [number, number] {
		let E = 0;
		let F = this.pi_o2 + 10;
		let O2CNT2 = 0;
		let CO2CT2 = 0;
		let G = 0;
		let nIter = 0;
		while (true) {
			G = (E + F) / 2.0;
			[O2CNT2, CO2CT2] = this.blood(G, pa_co2);
			const A10 = Math.abs(O2CNT2 - art_o2_con);
			if (A10 - 0.001 <= 0) break;
			else {
				if (O2CNT2 - art_o2_con < 0) E = G;
				else if (O2CNT2 - art_o2_con === 0) break;
				else F = G; // (O2CNT2-ARTO2C)>0
			}
			if (nIter > MAX_ITER) {
				//alert("Failure to converge in subroutine `sameO2`, results may be inaccurate");
				break;
			}
			nIter++;
		}
		const pa_o2 = G;
		return [pa_o2, CO2CT2];
	}
	/**
	 * Calculates the partial pressure of O2/CO2 in arterial blood from gas concentrations:
	 * @param art_o2_con Arterial O2 concentration
	 * @param art_co2_con Arterial CO2 concentration
	 */
	public fndten(art_o2_con: number, art_co2_con: number): number[] {
		const PI = new Array(5);
		let CO2CT2 = 0;

		PI[1] = 10.0;
		PI[2] = 1.0;
		PI[3] = 0.1;
		PI[4] = 0.01;
		let pa_o2 = 0;
		let pa_co2 = 0;
		const iter = 0;
		for (let K = 1; K <= 4; K++) {
			let nIter = 0;
			while (true) {
				pa_co2 = pa_co2 + PI[K];
				[pa_o2, CO2CT2] = this.sameo2(pa_co2, art_o2_con);
				if (CO2CT2 - art_co2_con >= 0) {
					pa_co2 = pa_co2 - PI[K];
					break;
				}
				if (nIter > MAX_ITER) {
					alert("Failure to converge in subroutine `fndten`, results may be inaccurate");
					break;
				}
				nIter++;
			}
		}
		return [pa_o2, pa_co2];
	}
	public grad_desc_ten(art_o2_con: Readonly<number>, art_co2_con: Readonly<number>): [number, number] {
		const loss = (X: [number, number]) => {
			const p_o2 = X[0];
			const p_co2 = X[1];
			const [calc_o2_con, calc_co2_con] = this.blood(p_o2, p_co2);
			const o2_loss = Math.abs(calc_o2_con - art_o2_con);
			const co2_loss = Math.abs(calc_co2_con - art_co2_con);
			return o2_loss + co2_loss;
		};
		const solution = fmin.nelderMead(loss, [55, 70]);
		return (solution as any).x;
	}
	public grad_desc_ven_admixture(pmv_o2: number, pmv_co2: number, mv_o2_con: number, mv_co2_con: number): [number, number, number, number] {
		const FI = this.fi_o2 + this.fi_co2;
		const SUM = Math.abs(FI - 1.0);
		const palv_o2_calc = (palv_co2: number): number => {
			let palv_o2 = 0;
			if (SUM <= 0.0001) {
				palv_o2 = this.pi_o2 - palv_co2 + this.pi_co2;
			} else {
				palv_o2 = this.pi_o2 * this.results.resp_quotient + palv_co2 * this.fi_o2 * (1.0 - this.results.resp_quotient) + this.pi_co2 - palv_co2;
				palv_o2 = palv_o2 / (this.results.resp_quotient + this.fi_co2 * (1.0 - this.results.resp_quotient));
			}
			return palv_o2;
		};
		const loss = (X: [number, number]) => {
			const search_palv_co2 = X[0];
			const search_palv_o2 = palv_o2_calc(search_palv_co2);
			const [search_o2_con, search_co2_con] = this.blood(search_palv_o2, search_palv_co2);
			const BLOODR = (mv_co2_con - search_co2_con) / (search_o2_con - mv_o2_con);
			return Math.abs(this.results.resp_quotient - BLOODR);
		};
		const solution = fmin.nelderMead(loss, [pmv_o2, pmv_co2]);
		const [ideal_palv_co2] = (solution as any).x;
		const ideal_palv_o2 = palv_o2_calc(ideal_palv_co2);
		const [ideal_o2_con, ideal_co2_con, _, ideal_pH] = this.blood(ideal_palv_o2, ideal_palv_co2);
		this.results.a_pH = ideal_pH;
		return [ideal_palv_o2, ideal_palv_co2, ideal_o2_con, ideal_co2_con];
	}
	public summary(pmv_o2: number, pmv_co2: number, mv_o2_con: number, mv_co2_con: number, art_o2_con: number, art_co2_con: number, v_o2: number, v_co2: number, PO22: number[], PCO22: number[], PN22: number[]) {
		let AA = 0.0;
		let BB = 0.0;
		// declare locally
		const V = this.alveoli.map((a) => (a.v_pct / 100) * this.results.total_vent);
		const Q = this.alveoli.map((a) => (a.q_pct / 100) * this.cardiac_output);
		for (let I = 0; I < this.alveoli.length; I++) {
			AA = AA + V[I] * PO22[I];
			BB = BB + V[I] * PCO22[I];
		}
		const mixed_alv_po2 = AA / this.results.total_vent; // Mixed Alveolar PO2
		const mixed_alv_pco2 = BB / this.results.total_vent; // Mixed Alveolar PCO2
		[this.results.pa_o2, this.results.pa_co2] = this.grad_desc_ten(art_o2_con, art_co2_con);
		this.results.resp_quotient = v_co2 / v_o2;
		this.results.art_o2_con = art_o2_con;
		this.results.art_co2_con = art_co2_con;
		const [ideal_palv_o2, ideal_palv_co2, ideal_o2_con, ideal_co2_con] = this.grad_desc_ven_admixture(pmv_o2, pmv_co2, mv_o2_con, mv_co2_con);
		//Calculate alveolar deadspace %
		const ALVDS = (100.0 * (ideal_palv_co2 - mixed_alv_pco2)) / (ideal_palv_co2 - this.pi_co2);
		//calculate total dead space %
		let deadspace_pct = (ALVDS / 100) * ((this.resp_rate * this.tidal_vol) / 1000 - (0.1 + ((this.tv_deadspace_pct / 100) * this.tidal_vol) / 1000) * this.resp_rate);
		deadspace_pct = deadspace_pct + (0.1 + ((this.tv_deadspace_pct / 100) * this.tidal_vol) / 1000) * this.resp_rate;
		this.results.deadspace_pct = (deadspace_pct / ((this.resp_rate * this.tidal_vol) / 1000)) * 100;
		this.results.venous_admixture_pct = (100.0 * (ideal_o2_con - art_o2_con)) / (ideal_o2_con - mv_o2_con);
		this.results.hgb_sat = this.kelman_hgb_sat(this.results.pa_o2, this.results.pa_co2, this.results.a_pH);

		return;
	}

	/**
	Use known constants w/ Henderson-Hasselbach Eq to calculate pH
	@returns calculated pH
	*/
	public henderson_hasselbach_pH(pa_co2: number, bicarb: number) {
		return 6.1 + Math.log10(bicarb / (0.03 * pa_co2));
	}
}

/**
Bohr's method for determining ratio of dead space to tidal volume
@param PeCO2 partial pressure of CO2 in exhaled air
@param PaCO2 partial pressure of CO2 in arterial blood
@return proportion of tidal volume occupied by physiologic dead-space from concentration of CO2 in exhaled air and arterial blood
*/
function bohr_dead_space(PeCO2: number, PaCO2: number): number {
	return (PaCO2 - PeCO2) / PaCO2;
}

/**
Alveolar ventilation equation
@param vCO2 rate of CO2 production
@param vA alveolar ventillation
@returns Predicted partial pressure of alveolar co2
*/
function alveolar_gas_eq(vCO2: number, vA: number): number {
	const K = 0; //TODO: Find this constant?
	return (vCO2 * K) / vA;
}
