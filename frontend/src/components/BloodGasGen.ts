import {BloodGas, DisturbType, RefRngs, RefRngMidpoint} from "./BloodGas";

export function floatFix(f: number, precision: number): number {
	return parseFloat(f.toFixed(precision));
}

export function randFloat(min: number, max: number, precision: number): number {
	return floatFix((Math.random() * (max - min)) + min, precision);
}
function randPick<T>(arr: T[]): T {
	return arr[Math.floor(arr.length * Math.random())];
}

const upperLimitPaCO2 = 80;
const lowerLimitPaCO2 = 15;
const upperLimitBicarb = 54;
const lowerLimitBicarb = 4;
const upperLimitAG = 28;
const upperLimitDG = 24;
const floatLenMax = 5;

export const abgGenerators: {[disturb: string]: (truncateValues: boolean) => [BloodGas, DisturbType[]]} = {
	"Normal": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(RefRngMidpoint("PaCO2") - 4, RefRngMidpoint("PaCO2") + 4, truncateValues ? 0 : floatLenMax);
		newGas.abg.bicarb = randFloat(RefRngMidpoint("aBicarb") - 2, RefRngMidpoint("aBicarb") + 2, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [DisturbType.Normal]];
	},
	/*"Decompensated Respiratory Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.upper + 6, 90, truncateValues ? 0 : floatLenMax);
		const bicarbMidpoint = RefRngMidpoint("aBicarb");
		newGas.abg.bicarb = randFloat(bicarbMidpoint - 4, bicarbMidpoint - 2, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : 10);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.RespAcid], [DisturbType.MetAcid]]];
	},*/
	"Compensated Respiratory Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.upper + 10, 100, truncateValues ? 0 : floatLenMax);
		const bicarbMidpoint = newGas.compensatedBicarb();
		newGas.abg.bicarb = randFloat(bicarbMidpoint - 1, bicarbMidpoint + 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [DisturbType.RespAcid]];
	},
	"Compensated Respiratory Alkalosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(10, RefRngs.PaCO2!.lower - 10, truncateValues ? 0 : floatLenMax);
		const bicarbMidpoint = newGas.compensatedBicarb();
		newGas.abg.bicarb = randFloat(bicarbMidpoint - 1, bicarbMidpoint + 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [DisturbType.RespAlk]];
	},
	"Compensated Metabolic Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.bicarb = randFloat(4, RefRngs.aBicarb!.lower - 4, truncateValues ? 0 : floatLenMax);
		const wintersFormulaMid = (1.5 * newGas.abg.bicarb!) + 8;
		newGas.abg.PaCO2 = randFloat(wintersFormulaMid - 1, wintersFormulaMid + 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [DisturbType.MetAcid]];
	},
	"Compensated Metabolic Alkalosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.bicarb = randFloat(RefRngs.aBicarb!.upper + 4, upperLimitBicarb, truncateValues ? 0 : floatLenMax);
		// from "Interpretation of Arterial Blood Gases." Pocket ICU Management
		const formulaMid = (0.7 * newGas.abg.bicarb!) + 20;
		newGas.abg.PaCO2 = randFloat(formulaMid - 1, formulaMid + 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [DisturbType.MetAlk]];
	},
	"Compensated Anion Gap Metabolic Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 6, upperLimitAG, truncateValues ? 0 : floatLenMax);
		const randDeltaGap =  randFloat(RefRngs.DeltaGap!.lower + 1, RefRngs.DeltaGap!.upper - 1, truncateValues ? 0 : floatLenMax);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, truncateValues ? 0 : floatLenMax);
		const wintersFormulaMid = (1.5 * newGas.abg.bicarb!) + 8;
		newGas.abg.PaCO2 = randFloat(wintersFormulaMid - 1, wintersFormulaMid + 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, truncateValues ? 0 : floatLenMax);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [DisturbType.AnionGap]];
	},
	"Metabolic Acidosis + Respiratory Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 2, truncateValues ? 0 : floatLenMax);
		newGas.abg.PaCO2 = randFloat(RefRngMidpoint("PaCO2") + 6, upperLimitPaCO2, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [DisturbType.MetAcid, DisturbType.RespAcid]];
	},
	"Metabolic Alkalosis + Respiratory Alkalosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.bicarb = randFloat(RefRngs.aBicarb!.upper + 2, upperLimitBicarb, truncateValues ? 0 : floatLenMax);
		newGas.abg.PaCO2 = randFloat(lowerLimitPaCO2, RefRngMidpoint("PaCO2") - 6, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, truncateValues ? 0 : floatLenMax);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [DisturbType.MetAlk, DisturbType.RespAlk]];
	},
	"Anion Gap Metabolic Acidosis + Respiratory Acidosis": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 6, upperLimitAG, truncateValues ? 0 : floatLenMax);
		const randDeltaGap =  randFloat(RefRngs.DeltaGap!.lower + 1, RefRngs.DeltaGap!.upper - 1, truncateValues ? 0 : floatLenMax);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, truncateValues ? 0 : floatLenMax);
		newGas.abg.PaCO2 = randFloat(RefRngMidpoint("PaCO2") + 6, upperLimitPaCO2, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, truncateValues ? 0 : floatLenMax);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [DisturbType.AnionGap, DisturbType.RespAcid]];
	},
	// Wrenn, K. (1990). The delta (Δ) gap: An approach to mixed acid-base disorders. Annals of emergency medicine, 19(11), 1310-1313.
	// "Most commonly, there is either a mixed high AG and normal AG acidosis, or a mixed high AG acidosis and chronic respiratory alkalosis with a compensating hyperchloremic acidosis."
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		// bicarb = DeltaGap - AnionGap + AG.upper + aBicarb.lower > 0
		// DeltaGap - AnionGap > -(RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower)
		// randAnionGap < (RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower + randDeltaGap)
	/**
	 * Generates a mixed high AG and normal AG acidosis
	 */
	/*"Uncompensated Negative Delta Gap": (truncateValues: boolean = true) => {
		let pH = Infinity;
		const newGas = new BloodGas({abg: {}});
		// TODO: Fix me! Unclear why (math error somewhere), but occasionally returns bicarb of 0, causing pH = Infinity
		while (!isFinite(pH)) {
			const randDeltaGap =  randFloat(-upperLimitDG + 4, -RefRngs.AnionGap!.upper - 1, truncateValues ? 0 : floatLenMax);
			const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 1, randDeltaGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower, truncateValues ? 0 : floatLenMax);
			// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
			// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower > lowerLimitBicarb
			// AG > lowerLimitBicarb - AG.upper - Bicarb.lower
			newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
			// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, truncateValues ? 0 : floatLenMax);
			const wintersFormulaMid = (1.5 * newGas.abg.bicarb!) + 8;
			newGas.abg.PaCO2 = randFloat(wintersFormulaMid + 3, wintersFormulaMid + 6, truncateValues ? 0 : floatLenMax);
			newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
			pH = newGas.abg.pH;
			newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, truncateValues ? 0 : floatLenMax);
			// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
			newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		}
		return [newGas, [DisturbType.AnionGap, DisturbType.MetAcid]];
	},*/
	/**
	 * Generates a mixed high AG acidosis (like AKA) coexisting with a chronic respiratory alkalosis (hyperventilation) with a compensatory hyperchloremic acidosis (renal excretion of base)
	 */
	/*"Compensated Negative Delta Gap": (truncateValues: boolean = true) => {
		let pH = Infinity;
		const newGas = new BloodGas({abg: {}});
		// TODO: Fix me! Unclear why (math error somewhere), but occasionally returns bicarb of 0, causing pH = Infinity
		while (!isFinite(pH)) {
			const randDeltaGap =  randFloat(-upperLimitDG + 4, -RefRngs.AnionGap!.upper - 1, truncateValues ? 0 : floatLenMax);
			const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 2, randDeltaGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower, truncateValues ? 0 : floatLenMax);
			// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower > lowerLimitBicarb
			// AG > lowerLimitBicarb - AG.upper - Bicarb.lower
			newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
			// randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower > 0
			// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, truncateValues ? 0 : floatLenMax);
			const wintersFormulaMid = (1.5 * newGas.abg.bicarb!) + 8;
			newGas.abg.PaCO2 = randFloat(wintersFormulaMid - 2, wintersFormulaMid + 2, truncateValues ? 0 : floatLenMax);
			newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
			pH = newGas.abg.pH;
			newGas.abg.Cl = randFloat(RefRngs.Cl!.lower + 4, RefRngs.Cl!.upper + 10, truncateValues ? 0 : floatLenMax);
			// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
			newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		}
		return [newGas, [DisturbType.AnionGap, DisturbType.MetAcid, DisturbType.CompleteComp]];
	},*/
	/**
	 * 	Generates a high AG acidosis mixed with a primary metabolic alkalosis
	 */
	/*"Uncompensated Positive Delta Gap": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 2, upperLimitAG, truncateValues ? 0 : floatLenMax);
		const randDeltaGap =  randFloat(RefRngs.DeltaGap!.upper + 1, upperLimitDG, truncateValues ? 0 : floatLenMax);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, truncateValues ? 0 : floatLenMax);
		const formulaMid = (0.7 * newGas.abg.bicarb!) + 20;
		newGas.abg.PaCO2 = randFloat(formulaMid - 6, formulaMid - 3, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, truncateValues ? 0 : floatLenMax);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [DisturbType.AnionGap, DisturbType.MetAlk]];
	},
	"Compensated Positive Delta Gap": (truncateValues: boolean = true) => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 2, upperLimitAG, truncateValues ? 0 : floatLenMax);
		const randDeltaGap =  randFloat(RefRngs.DeltaGap!.upper + 1, upperLimitDG, truncateValues ? 0 : floatLenMax);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		const formulaMid = (0.7 * newGas.abg.bicarb!) + 20;
		newGas.abg.PaCO2 = randFloat(formulaMid - 2, formulaMid + 2, truncateValues ? 0 : floatLenMax);
		newGas.abg.pH = floatFix(newGas.pHExpected(), truncateValues ? 2 : floatLenMax);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, truncateValues ? 0 : floatLenMax);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [DisturbType.AnionGap, DisturbType.MetAlk, DisturbType.CompleteComp]];
	},*/
};
