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

export const abgGenerators: {[disturb: string]: () => [BloodGas, DisturbType[][]]} = {
	"Normal": () => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.pH = randFloat(RefRngMidpoint("apH") - 0.02, RefRngMidpoint("apH") + 0.02, 2);
		newGas.abg.PaCO2 = randFloat(RefRngMidpoint("PaCO2") - 2, RefRngMidpoint("PaCO2") + 2, 0);
		newGas.abg.bicarb = floatFix(newGas.bicarbExpected(), 0);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.Normal]]];
	},
	"Respiratory Acidosis": () => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.upper + 1, upperLimitPaCO2, 0);
		newGas.abg.bicarb = randFloat(RefRngs.aBicarb!.lower, RefRngs.aBicarb!.upper, 0);
		newGas.abg.pH = floatFix(newGas.pHExpected(), 2);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.RespAcid]]];
	},
	"Respiratory Alkalosis": () => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(lowerLimitPaCO2, RefRngs.PaCO2!.lower - 1, 0);
		newGas.abg.bicarb = randFloat(RefRngs.aBicarb!.lower, RefRngs.aBicarb!.upper, 0);
		newGas.abg.pH = floatFix(newGas.pHExpected(), 2);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.RespAlk]]];
	},
	"Metabolic Alkalosis": () => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.bicarb = randFloat(RefRngs.aBicarb!.upper + 1, upperLimitBicarb, 0);
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.lower, RefRngs.PaCO2!.upper, 0);
		newGas.abg.pH = floatFix(newGas.pHExpected(), 2);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.MetAlk]]];
	},
	"Compensated Metabolic Alkalosis": () => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.bicarb = randFloat(RefRngs.aBicarb!.upper + 8, upperLimitBicarb, 0);
		// from "Interpretation of Arterial Blood Gases." Pocket ICU Management
		const formulaMid = (0.7 * newGas.abg.bicarb!) + 20;
		newGas.abg.PaCO2 = randFloat(formulaMid + 1, formulaMid + 2, 0);
		newGas.abg.pH = floatFix(newGas.pHExpected(), 2);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.MetAlk], [DisturbType.RespAcid]]];
	},
	"Metabolic Acidosis": () => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, 0);
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.lower, RefRngs.PaCO2!.upper, 0);
		newGas.abg.pH = floatFix(newGas.pHExpected(), 2);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.MetAcid]]];
	},
	"Compensated Metabolic Acidosis": () => {
		const newGas = new BloodGas({abg: {}});
		newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 6, 0);
		const wintersFormulaMid = (1.5 * newGas.abg.bicarb!) + 8;
		newGas.abg.PaCO2 = randFloat(wintersFormulaMid - 2, wintersFormulaMid, 0);
		newGas.abg.pH = floatFix(newGas.pHExpected(), 2);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.MetAcid], [DisturbType.RespAlk]]];
	},
	"Anion Gap Metabolic Acidosis": () => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 2, upperLimitAG, 0);
		const randDeltaGap =  randFloat(RefRngs.DeltaGap!.lower + 1, RefRngs.DeltaGap!.upper - 1, 0);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, 0);
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.lower, RefRngs.PaCO2!.upper, 0);
		newGas.abg.pH = floatFix(newGas.pHExpected(), 2);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, 0);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [[DisturbType.MetAcid, DisturbType.AnionGap]]];
	},
	"Positive Delta Gap Metabolic Acidosis": () => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 2, upperLimitAG, 0);
		const randDeltaGap =  randFloat(RefRngs.DeltaGap!.upper + 1, upperLimitDG, 0);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, 0);
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.lower, RefRngs.PaCO2!.upper, 0);
		newGas.abg.pH = floatFix(newGas.pHExpected(), 2);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, 0);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [[DisturbType.MetAcid, DisturbType.AnionGap], [DisturbType.MetAlk]]];
	},
	"Negative Delta Gap Metabolic Acidosis": () => {
		const newGas = new BloodGas({abg: {}});
		// DeltaGap = DeltaAG - DeltaBicarb = (AG - AG.upper) - (Bicarb.lower - Bicarb)
		const randAnionGap = randFloat(RefRngs.AnionGap!.upper + 2, upperLimitAG, 0);
		const randDeltaGap =  randFloat(-upperLimitDG, RefRngs.DeltaGap!.lower - 1, 0);
		// DeltaGap = AG - AG.upper - Bicarb.lower + Bicarb
		// Bicarb = DeltaGap - AG + AG.upper + Bicarb.lower > lowerLimitBicarb
		// AG > lowerLimitBicarb - AG.upper - Bicarb.lower
		newGas.abg.bicarb = randDeltaGap - randAnionGap + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		// newGas.abg.bicarb = randFloat(lowerLimitBicarb, RefRngs.aBicarb!.lower - 1, 0);
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.lower, RefRngs.PaCO2!.upper, 0);
		newGas.abg.pH = floatFix(newGas.pHExpected(), 2);
		newGas.abg.Cl = randFloat(RefRngs.Cl!.lower, RefRngs.Cl!.upper, 0);
		// DeltaGap = Na - Cl - AG.upper - Bicarb.lower
		newGas.abg.Na = randDeltaGap + newGas.abg.Cl + RefRngs.AnionGap!.upper + RefRngs.aBicarb!.lower;
		return [newGas, [[DisturbType.MetAcid, DisturbType.AnionGap], [DisturbType.MetAcid]]];
	},
	/*"Compensated Respiratory Acidosis": () => {
		// Adjusted PaCO2
		const newGas = new BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.upper + 1, upperLimitPaCO2, 0);
		newGas.abg.pH = randFloat(RefRngs.apH!.lower, RefRngMidpoint("apH") + 0.02, 2);
		newGas.abg.bicarb = floatFix(newGas.bicarbExpected(), 0);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.RespAcid], [DisturbType.MetAlk]]];
	},
	"Compensated Respiratory Alkalosis": () => {
		// Adjusted PaCO2
		const newGas = new BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(lowerLimitPaCO2, RefRngs.PaCO2!.lower, 0);
		newGas.abg.pH = randFloat(RefRngMidpoint("apH") - 0.02, RefRngs.apH!.upper, 2);
		newGas.abg.bicarb = floatFix(newGas.bicarbExpected(), 0);
		newGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[DisturbType.RespAlk], [DisturbType.MetAcid, DisturbType.Hyperchloremic]]];
	},*/
};

/* export function generateRandABG(UserpH?: number): [BloodGas, DisturbType[][]] {
	const randGas = new BloodGas({
		abg: {},
	});
	const disturbList = [] as DisturbType[][];
	// What is the pH?
	randGas.abg.pH = UserpH || randFloat(RefRngs.apH!.lower - 0.3, RefRngs.apH!.upper + 0.3, 2);
	// Has acidemia.
	if (randGas.phDisturbance() === DisturbType.Acidemia) {
		// Metabolic or respiratory acidosis?
		const disturbPick = randPick([DisturbType.MetAcid, DisturbType.RespAcid]);
		// Has metabolic acidosis.
		if (disturbPick === DisturbType.MetAcid) {
			// Randomize to low bicarb, normal PaCO2
			randGas.abg.bicarb = randFloat(RefRngs.aBicarb!.lower - ((RefRngs.aBicarb!.upper - RefRngs.aBicarb!.lower) / 2), RefRngs.aBicarb!.lower, 0);
			randGas.abg.PaCO2 = floatFix(randGas.co2Expected(), 0);
			// Is there anion gap?
			const agPick = randPick([DisturbType.AnionGap, DisturbType.Hyperchloremic]);
			disturbList.push([disturbPick, agPick]);
			// Has anion gap metabolic acidosis.
			if (agPick === DisturbType.AnionGap) {
				randGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, 0);
				// Must have Na - Bicarb - Cl > AnionGap.upper + 1
				// So Cl < Na - (Bicarb + AnionGap.upper + 1)
				// Should have Na - Bicarb - Cl < AnionGap.upper + 10
				// So Cl > Na - (Bicarb + AnionGap.upper + 10)
				randGas.abg.Cl = randFloat(
					randGas.abg.Na - (RefRngs.AnionGap!.upper + 10 + randGas.abg.bicarb),
					randGas.abg.Na - (RefRngs.AnionGap!.upper + 1 + randGas.abg.bicarb),
					0,
				);
			}
		// Has respiratory acidosis.
		} else if (disturbPick === DisturbType.RespAcid) {
			disturbList.push([disturbPick]);
			randGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.upper, RefRngs.PaCO2!.upper + ((RefRngs.PaCO2!.upper - RefRngs.PaCO2!.lower) / 2), 0);
			randGas.abg.bicarb = floatFix(randGas.bicarbExpected(), 0);
		}
	} else if (randGas.phDisturbance() === DisturbType.Alkalemia) {
		const disturbPick = randPick([DisturbType.MetAlk, DisturbType.RespAlk]);
		disturbList.push([disturbPick]);
		if (disturbPick === DisturbType.MetAlk) {
			randGas.abg.bicarb = randFloat(RefRngs.aBicarb!.upper, RefRngs.aBicarb!.upper + ((RefRngs.aBicarb!.upper - RefRngs.aBicarb!.lower) / 2), 0);
			randGas.abg.PaCO2 = floatFix(randGas.co2Expected(), 0);
			// Vomiting decreases HCl lvls causing metabolic alkalosis
		} else if (disturbPick === DisturbType.RespAlk) {
			randGas.abg.PaCO2 = randFloat(RefRngs.PaCO2!.lower - ((RefRngs.PaCO2!.upper - RefRngs.PaCO2!.lower) / 2), RefRngs.PaCO2!.lower, 0);
			randGas.abg.bicarb = floatFix(randGas.bicarbExpected(), 0);
		}
	} else {
		// const disturbPick = randPick([DisturbType.MetAcid, DisturbType.RespAcid])
		randGas.abg.bicarb = randFloat(RefRngs.aBicarb!.lower, RefRngs.aBicarb!.upper, 0);
		randGas.abg.PaCO2 = floatFix(randGas.co2Expected(), 0);
	}
	if (!randGas.abg.Na || !randGas.abg.Cl) {
		randGas.abg.Na = randFloat(RefRngs.Na!.lower, RefRngs.Na!.upper, 0);
		// Must have Na - Bicarb - Cl < AnionGap.upper - 1
		// So Cl > Na - (Bicarb + AnionGap.upper - 1)
		// Must have Na - Bicarb - Cl > AnionGap.lower + 1
		// So Cl < Na - (Bicarb + AnionGap.lower + 1)
		randGas.abg.Cl = randFloat(
			randGas.abg.Na - (RefRngs.AnionGap!.upper - 1 + randGas.abg.bicarb!),
			randGas.abg.Na - (RefRngs.AnionGap!.lower + 1 + randGas.abg.bicarb!),
			0,
		);
	}
	randGas.abg.Albumin = 4.5;
	return [randGas, disturbList];
} */
