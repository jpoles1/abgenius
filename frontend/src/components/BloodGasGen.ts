import {BloodGas, DisturbType, RefRngs, RefRngMidpoint} from "./BloodGas";

function floatFix(f: number, precision: number): number {
	return parseFloat(f.toFixed(precision));
}

function randFloat(min: number, max: number, precision: number): number {
	return floatFix((Math.random() * (max - min)) + min, precision);
}
function randPick<T>(arr: T[]): T {
	return arr[Math.floor(arr.length * Math.random())];
}

const upperLimitPaCO2 = 75;
const lowerLimitPaCO2 = 12;
const upperLimitBicarb = 54;
const lowerLimitBicarb = 12;
const upperLimitAG = 22;
const upperLimitDG = 10;
const floatLenMax = 5;

export const abgGenerators: {[disturb: string]: (truncateValues: boolean) => [BloodGas, DisturbType[][]]} = {
	"Normal": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.pH = randFloat(RefRngMidpoint("apH") - 0.02, RefRngMidpoint("apH") + 0.02, truncateValues ? 2 : floatLenMax);
		newGas.abg.PaCO2 = randFloat(RefRngMidpoint("PaCO2") - 2, RefRngMidpoint("PaCO2") + 2, truncateValues ? 0 : floatLenMax);
		newGas.abg.bicarb = floatFix(newGas.bicarbExpected(), truncateValues ? 0 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.Normal]]];
	},
	"Acute Respiratory Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.upper + 1, upperLimitPaCO2, truncateValues ? 0 : floatLenMax);
		newGas.abg.bicarb = floatFix((((newGas.abg.PaCO2 - RefRngMidpoint("PaCO2")) / 10) + 24), truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : 10);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.RespAcid]]];
	},
	"Chronic Respiratory Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.upper + 1, upperLimitPaCO2, truncateValues ? 0 : floatLenMax);
		newGas.abg.bicarb = floatFix((((newGas.abg.PaCO2 - RefRngMidpoint("PaCO2")) / 3) + 24), truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.RespAcid]]];
	},
	"Acute Respiratory Alkalosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(lowerLimitPaCO2, RefRngs.PaCO2!.lower - 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.bicarb = floatFix(24 - ((RefRngMidpoint("PaCO2") - newGas.abg.PaCO2) / 5), truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.RespAlk]]];
	},
	"Chronic Respiratory Alkalosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(lowerLimitPaCO2, RefRngs.PaCO2!.lower - 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.bicarb = floatFix(24 - ((RefRngMidpoint("PaCO2") - newGas.abg.PaCO2) / 2), truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.RespAlk]]];
	},
	"Metabolic Alkalosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.bicarb = randFloat(RefRngs.aBicarb!.upper + 1, upperLimitBicarb, truncateValues ? 0 : floatLenMax);
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.lower, RefRngs.PaCO2!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.MetAlk]]];
	},
	"Compensated Metabolic Alkalosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.bicarb = randFloat(RefRngs.aBicarb!.upper + 8, upperLimitBicarb, truncateValues ? 0 : floatLenMax);
		// from "Interpretation of Arterial Blood Gases." Pocket ICU Management
		const formulaMid = (0.7 * newGas.abg.bicarb!) + 20;
		newGas.abg.PaCO2 = randFloat(formulaMid + 1, formulaMid + 2, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.MetAlk], [DisturbType.RespAcid]]];
	},
	"Metabolic Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.lower, RefRngs.PaCO2!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.MetAcid]]];
	},
	"Compensated Metabolic Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 6, truncateValues ? 0 : floatLenMax);
		const wintersFormulaMid = (1.5 * newGas.abg.bicarb!) + 8;
		newGas.abg.PaCO2 = randFloat(wintersFormulaMid - 2, wintersFormulaMid, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.MetAcid], [DisturbType.RespAlk]]];
	},
	"Anion Gap Metabolic Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 2, upperLimitAG, truncateValues ? 0 : floatLenMax);
		const randDeltaGap =  randFloat(RefRngs.DeltaGap!.lower + 1, RefRngs.DeltaGap!.upper - 1, truncateValues ? 0 : floatLenMax);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.lower, RefRngs.PaCO2!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, truncateValues ? 0 : floatLenMax);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [[DisturbType.MetAcid, DisturbType.AnionGap]]];
	},
	"Compensated Anion Gap Metabolic Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 2, upperLimitAG, truncateValues ? 0 : floatLenMax);
		const randDeltaGap =  randFloat(RefRngs.DeltaGap!.lower + 1, RefRngs.DeltaGap!.upper - 1, truncateValues ? 0 : floatLenMax);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.PaCO2 = randFloat(lowerLimitPaCO2, RefRngs.PaCO2!.lower - 4, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, truncateValues ? 0 : floatLenMax);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [[DisturbType.MetAcid, DisturbType.AnionGap], [DisturbType.RespAlk]]];
	},
	"Positive Delta Gap Metabolic Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 2, upperLimitAG, truncateValues ? 0 : floatLenMax);
		const randDeltaGap =  randFloat(RefRngs.DeltaGap!.upper + 1, upperLimitDG, truncateValues ? 0 : floatLenMax);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.lower, RefRngs.PaCO2!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, truncateValues ? 0 : floatLenMax);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [[DisturbType.MetAcid, DisturbType.AnionGap], [DisturbType.MetAlk]]];
	},
	"Compensated Positive Delta Gap Metabolic Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 2, upperLimitAG, truncateValues ? 0 : floatLenMax);
		const randDeltaGap =  randFloat(RefRngs.DeltaGap!.upper + 1, upperLimitDG, truncateValues ? 0 : floatLenMax);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		newGas.abg.PaCO2 = randFloat(lowerLimitPaCO2, RefRngs.PaCO2!.lower - 4, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, truncateValues ? 0 : floatLenMax);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [[DisturbType.MetAcid, DisturbType.AnionGap], [DisturbType.MetAlk], [DisturbType.RespAlk]]];
	},
	"Negative Delta Gap Metabolic Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 2, upperLimitAG, truncateValues ? 0 : floatLenMax);
		const randDeltaGap =  randFloat(-upperLimitDG, RefRngs.DeltaGap!.lower - 1, truncateValues ? 0 : floatLenMax);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower > lowerLimitBicarb
		// AG > lowerLimitBicarb - AG.upper - Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.lower, RefRngs.PaCO2!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, truncateValues ? 0 : floatLenMax);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [[DisturbType.MetAcid, DisturbType.AnionGap], [DisturbType.MetAcid]]];
	},
	"Compensated Negative Delta Gap Metabolic Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 2, upperLimitAG, truncateValues ? 0 : floatLenMax);
		const randDeltaGap =  randFloat(-upperLimitDG, RefRngs.DeltaGap!.lower - 1, truncateValues ? 0 : floatLenMax);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower > lowerLimitBicarb
		// AG > lowerLimitBicarb - AG.upper - Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.PaCO2 = randFloat(lowerLimitPaCO2, RefRngs.PaCO2!.lower - 4, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, truncateValues ? 0 : floatLenMax);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [[DisturbType.MetAcid, DisturbType.AnionGap], [DisturbType.MetAcid], [DisturbType.RespAlk]]];
	},
};
