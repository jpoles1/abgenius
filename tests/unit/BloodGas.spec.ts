import * as BG from "../../src/components/BloodGas";

describe("BloodGas utilities", () => {
	test("Finding reference range midpoint", () => {
		expect(BG.RefRngMidpoint("apH")).toEqual(7.4);
		expect(() => { BG.RefRngMidpoint("z"); }).toThrow();
	});
	test("Age-based O2 sat compensation", () => {
		const scenario1: BG.BloodGas = new BG.BloodGas({abg: {}});
		expect(scenario1.adjustedPaO2()).toEqual({lower: 80, upper: 100});
		scenario1.abg.patientAge = 24;
		expect(scenario1.adjustedPaO2()).toEqual({lower: 80, upper: 100});
		scenario1.abg.patientAge = 70;
		expect(scenario1.o2Disturbance()).toEqual(BG.DisturbType.Unknown);
		scenario1.abg.PaO2 = 68;
		expect(scenario1.adjustedPaO2()).toEqual({lower: 70, upper: 100});
		expect(scenario1.o2Disturbance()).toBe(BG.DisturbType.Hypoxemia);
		scenario1.abg.PaO2 = 72;
		expect(scenario1.o2Disturbance()).toBe(BG.DisturbType.Normal);
		scenario1.abg.patientAge = 0;
		expect(scenario1.o2Disturbance()).toBe(BG.DisturbType.Hyperoxemia);
	});
	test("Validates ABG values", () => {
		const scenario1: BG.BloodGas = new BG.BloodGas({abg: {}});
		expect(scenario1.realisticABG()).toBe(false);
		expect(scenario1.validABG()).toBe(false);
		scenario1.abg.pH = 7.2;
		expect(scenario1.validABG()).toBe(false);
		scenario1.abg.bicarb = 14;
		expect(scenario1.validABG()).toBe(false);
		scenario1.abg.PaCO2 = 80;
		expect(scenario1.validABG()).toBe(true);
	});
	test("Validates electrolyte values", () => {
		const scenario1: BG.BloodGas = new BG.BloodGas({abg: {}});
		expect(scenario1.validLytes()).toBe(false);
		scenario1.abg.bicarb = 22;
		expect(scenario1.validLytes()).toBe(false);
		scenario1.abg.Cl = 102;
		expect(scenario1.validLytes()).toBe(false);
		scenario1.abg.Na = 142;
		expect(scenario1.validLytes()).toBe(true);
	});
	test("Anion Gap", () => {
		const scenario1: BG.BloodGas = new BG.BloodGas({abg: {}});
		expect(scenario1.serumAnionGap()).toEqual({gap: NaN, disturb: BG.DisturbType.Unknown});
		scenario1.abg = {
			bicarb: 32,
			Na: 145,
			Cl: 105,
		};
		expect(scenario1.serumAnionGap()).toEqual({gap: 8, disturb: BG.DisturbType.Normal});
		scenario1.abg.Cl = 95;
		expect(scenario1.serumAnionGap()).toEqual({gap: 18, disturb: BG.DisturbType.AnionGap});
	});
	test("Winters Formula", () => {
		const scenario1: BG.BloodGas = new BG.BloodGas({
			abg: {
				pH: 7.25,
				PaCO2: 38,
				bicarb: 16,
			},
		});
		expect(scenario1.wintersFormula()).toEqual({lower: 30, upper: 34});
	});
});
test("pH Disturbances", () => {
	const scenario1: BG.BloodGas = new BG.BloodGas({abg: {}});
	expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Unknown);
	scenario1.abg.pH = 7.46;
	expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Alkalemia);
	scenario1.abg.pH = 7.34;
	expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Acidemia);
	scenario1.abg.pH = 7.36;
	expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Normal);
});
describe("Blood gas scenarios", () => {
	test("Normal Sample", () => {
		const scenario1: BG.BloodGas = new BG.BloodGas({
			abg: {
				pH: 7.4,
				bicarb: 25,
				PaCO2: 40,
				PaO2: 90,
				Na: 138,
				Cl: 104,
			},
		});
		expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Normal);
		expect(scenario1.guessDisturbances()).toEqual([[BG.DisturbType.Normal]]);
		expect(scenario1.serumAnionGap()).toEqual({gap: 9, disturb: BG.DisturbType.Normal});
		expect(scenario1.serumDeltaGap()).toEqual({gap: 0, disturb: BG.DisturbType.Normal});
	});
	test("Incomplete Cases", () => {
		const scenario1 = new BG.BloodGas({
			abg: {},
		});
		expect(scenario1.guessDisturbances()).toEqual([[BG.DisturbType.Unknown]]);
		scenario1.abg = {
			pH: 7.4,
			bicarb: 25,
			PaCO2: 40,
		};
		expect(scenario1.guessDisturbances()).toEqual([[BG.DisturbType.Unknown]]);
	});
	test("Respiratory Acidosis", () => {
		const scenario1 = new BG.BloodGas({
			abg: {
				pH: 7.25,
				PaCO2: 60,
				bicarb: 27,
				Na: 137,
				Cl: 100,
			},
		});
		expect(scenario1.realisticABG()).toEqual(true);
		expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Acidemia);
		expect(scenario1.serumAnionGap()).toEqual({gap: 10, disturb: BG.DisturbType.Normal});
		expect(scenario1.guessDisturbances()).toEqual([
			[BG.DisturbType.RespAcid],
		]);
		/*const scenario2 = new BG.BloodGas({
			abg: {
				pH: 7.37,
				PaCO2: 57,
				bicarb: 32,
				Na: 137,
				Cl: 98,
			},
		});
		expect(scenario2.realisticABG()).toEqual(true);
		expect(scenario2.phDisturbance()).toEqual(BG.DisturbType.Normal);
		expect(scenario2.serumAnionGap()).toEqual({gap: 7, disturb: BG.DisturbType.Normal});
		expect(scenario2.guessDisturbances()).toEqual([
			[BG.DisturbType.RespAcid, BG.DisturbType.Compensated],
			[BG.DisturbType.MetAlk],
		].sort());*/
		const scenario3 = new BG.BloodGas({
			abg: {
				pH: 7.33,
				PaCO2: 57,
				bicarb: 29,
				Na: 137,
				Cl: 99,
			},
		});
		expect(scenario3.realisticABG()).toEqual(true);
		expect(scenario3.phDisturbance()).toEqual(BG.DisturbType.Acidemia);
		expect(scenario3.serumAnionGap()).toEqual({gap: 9, disturb: BG.DisturbType.Normal});
		expect(scenario3.guessDisturbances()).toEqual([
			[BG.DisturbType.RespAcid],
			[BG.DisturbType.MetAlk],
		].sort());
	});
	test("Respiratory Alkalosis", () => {
		const scenario1 = new BG.BloodGas({
			abg: {
				pH: 7.54,
				PaCO2: 25,
				bicarb: 22,
				Na: 137,
				Cl: 104,
			},
		});
		expect(scenario1.realisticABG()).toEqual(true);
		expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Alkalemia);
		expect(scenario1.serumAnionGap()).toEqual({gap: 11, disturb: BG.DisturbType.Normal});
		expect(scenario1.guessDisturbances()).toEqual([
			[BG.DisturbType.RespAlk],
		]);
		/*const scenario2 = new BG.BloodGas({
			abg: {
				pH: 7.44,
				PaCO2: 30,
				bicarb: 21,
				Na: 136,
				Cl: 106,
			},
		});
		expect(scenario2.realisticABG()).toEqual(true);
		expect(scenario2.phDisturbance()).toEqual(BG.DisturbType.Normal);
		expect(scenario2.serumAnionGap()).toEqual({gap: 9, disturb: BG.DisturbType.Normal});
		expect(scenario2.guessDisturbances()).toEqual([
			[BG.DisturbType.RespAlk, BG.DisturbType.Compensated],
			[BG.DisturbType.MetAcid, BG.DisturbType.Hyperchloremic],
		].sort());*/
		const scenario3 = new BG.BloodGas({
			abg: {
				pH: 7.33,
				PaCO2: 57,
				bicarb: 29,
				Na: 137,
				Cl: 99,
			},
		});
		expect(scenario3.realisticABG()).toEqual(true);
		expect(scenario3.phDisturbance()).toEqual(BG.DisturbType.Acidemia);
		expect(scenario3.serumAnionGap()).toEqual({gap: 9, disturb: BG.DisturbType.Normal});
		expect(scenario3.guessDisturbances()).toEqual([
			[BG.DisturbType.RespAcid],
			[BG.DisturbType.MetAlk],
		].sort());
	});
	/*
	test("Resp Alkalosis", () => {
		const scenario1 = new BG.BloodGas({
			abg: {
				pH: 7.41,
				PaCO2: 27,
				bicarb: 17,
			},
		});
		expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Normal);
		expect(scenario1.guessPrimaryDisturbance()).toEqual(BG.DisturbType.RespAlk);
		expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.MetAcid, BG.DisturbType.Chronic]);
		scenario1.abg.bicarb = 22;
		expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.MetAcid, BG.DisturbType.Acute]);
		scenario1.abg.bicarb = 23;
		expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.MetAcid, undefined]);
		scenario1.abg.bicarb = 30;
		expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.MetAlk, undefined]);
	});
	test("Met Acidosis", () => {
		// Primary: Metabolic Acidosis
		// Secondary Respiratory Alkalosis
		// Additional Metabolic Alkalosis.
		const scenario1 = new BG.BloodGas({
			abg: {
				pH: 7.41,
				PaCO2: 27,
				bicarb: 17,
				Na: 140,
				Cl: 97,
			},
		});
		expect(scenario1.realisticABG()).toEqual(true);
		expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Acidemia);
		expect(scenario1.serumAnionGap()).toEqual({gap: 18, disturb: BG.DisturbType.AnionGap});
		expect(scenario1.serumDeltaGap()).toEqual({gap: 18, disturb: BG.DisturbType.DeltaGap});
		expect(scenario1.guessPrimaryDisturbance()).toEqual(BG.DisturbType.MetAcid);
		expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.RespAlk, undefined]);
		expect(scenario1.guessDisturbances()).toEqual([
			[BG.DisturbType.MetAcid, BG.DisturbType.AnionGap],
			[ "Metabolic Alkalosis" ],
			[ "Respiratory Alkalosis", BG.DisturbType.Chronic],
		]);
	});
	test("Met Alkalosis", () => {
		const scenario1 = new BG.BloodGas({
			abg: {
				pH: 7.55,
				PaCO2: 50,
				bicarb: 40,
				Na: 140,
				Cl: 102,
			},
		});
		expect(scenario1.realisticABG()).toEqual(true);
		expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Alkalemia);
		expect(scenario1.guessPrimaryDisturbance()).toEqual(BG.DisturbType.MetAlk);
		expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.RespAcid, undefined]);
	});
	test("Metabolic acidosis + respiratory alkalosis", () => {
		const scenario1 = new BG.BloodGas({
			abg: {
				pH: 7.39,
				PaCO2: 24,
				bicarb: 14,
				Na: 140,
				Cl: 106,
			},
		});
		expect(scenario1.realisticABG()).toEqual(true);
		expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Normal);
		expect(scenario1.guessDisturbances()).toEqual([
			[BG.DisturbType.MetAcid, BG.DisturbType.AnionGap],
			[BG.DisturbType.RespAlk, BG.DisturbType.Chronic],
		]);
		expect(scenario1.guessPrimaryDisturbance()).toEqual(BG.DisturbType.MetAcid);
		expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.RespAlk]);
	});
	*/
});
