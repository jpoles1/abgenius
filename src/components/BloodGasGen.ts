import * as BG from "./BloodGas";

function floatFix(f: number, precision: number): number {
	return parseFloat(f.toFixed(precision));
}

function randFloat(min: number, max: number, precision: number): number {
	return floatFix((Math.random() * (max - min)) + min, precision);
}
function randPick<T>(arr: T[]): T {
	return arr[Math.floor(arr.length * Math.random())];
}

export function generateRandABG(UserpH?: number): [BG.BloodGas, BG.DisturbType[][]] {
	const randGas = new BG.BloodGas({
		abg: {},
	});
	const disturbList = [] as BG.DisturbType[][];
	// What is the pH?
	randGas.abg.pH = UserpH || randFloat(BG.RefRngs.apH!.lower - 0.3, BG.RefRngs.apH!.upper + 0.3, 2);
	// Has acidemia.
	if (randGas.phDisturbance() === BG.DisturbType.Acidemia) {
		// Metabolic or respiratory acidosis?
		const disturbPick = randPick([BG.DisturbType.MetAcid, BG.DisturbType.RespAcid]);
		// Has metabolic acidosis.
		if (disturbPick === BG.DisturbType.MetAcid) {
			// Randomize to low bicarb, normal PaCO2
			randGas.abg.bicarb = randFloat(BG.RefRngs.aBicarb!.lower - ((BG.RefRngs.aBicarb!.upper - BG.RefRngs.aBicarb!.lower) / 2), BG.RefRngs.aBicarb!.lower, 0);
			randGas.abg.PaCO2 = floatFix(randGas.co2Expected(), 0);
			// Is there anion gap?
			const agPick = randPick([BG.DisturbType.AnionGap, BG.DisturbType.Hyperchloremic]);
			disturbList.push([disturbPick, agPick]);
			// Has anion gap metabolic acidosis.
			if (agPick === BG.DisturbType.AnionGap) {
				randGas.abg.Na = randFloat(BG.RefRngs.Na!.lower, BG.RefRngs.Na!.upper, 0);
				// Must have Na - Bicarb - Cl > AnionGap.upper + 1
				// So Cl < Na - (Bicarb + AnionGap.upper + 1)
				// Should have Na - Bicarb - Cl < AnionGap.upper + 10
				// So Cl > Na - (Bicarb + AnionGap.upper + 10)
				randGas.abg.Cl = randFloat(
					randGas.abg.Na - (BG.RefRngs.AnionGap!.upper + 10 + randGas.abg.bicarb),
					randGas.abg.Na - (BG.RefRngs.AnionGap!.upper + 1 + randGas.abg.bicarb),
					0,
				);
			}
		// Has respiratory acidosis.
		} else if (disturbPick === BG.DisturbType.RespAcid) {
			disturbList.push([disturbPick]);
			randGas.abg.PaCO2 = randFloat(BG.RefRngs.PaCO2!.upper, BG.RefRngs.PaCO2!.upper + ((BG.RefRngs.PaCO2!.upper - BG.RefRngs.PaCO2!.lower) / 2), 0);
			randGas.abg.bicarb = floatFix(randGas.bicarbExpected(), 0);
		}
	} else if (randGas.phDisturbance() === BG.DisturbType.Alkalemia) {
		const disturbPick = randPick([BG.DisturbType.MetAlk, BG.DisturbType.RespAlk]);
		disturbList.push([disturbPick]);
		if (disturbPick === BG.DisturbType.MetAlk) {
			randGas.abg.bicarb = randFloat(BG.RefRngs.aBicarb!.upper, BG.RefRngs.aBicarb!.upper + ((BG.RefRngs.aBicarb!.upper - BG.RefRngs.aBicarb!.lower) / 2), 0);
			randGas.abg.PaCO2 = floatFix(randGas.co2Expected(), 0);
			// Vomiting decreases HCl lvls causing metabolic alkalosis
		} else if (disturbPick === BG.DisturbType.RespAlk) {
			randGas.abg.PaCO2 = randFloat(BG.RefRngs.PaCO2!.lower - ((BG.RefRngs.PaCO2!.upper - BG.RefRngs.PaCO2!.lower) / 2), BG.RefRngs.PaCO2!.lower, 0);
			randGas.abg.bicarb = floatFix(randGas.bicarbExpected(), 0);
		}
	} else {
		// const disturbPick = randPick([BG.DisturbType.MetAcid, BG.DisturbType.RespAcid])
		randGas.abg.bicarb = randFloat(BG.RefRngs.aBicarb!.lower, BG.RefRngs.aBicarb!.upper, 0);
		randGas.abg.PaCO2 = floatFix(randGas.co2Expected(), 0);
	}
	if (!randGas.abg.Na || !randGas.abg.Cl) {
		randGas.abg.Na = randFloat(BG.RefRngs.Na!.lower, BG.RefRngs.Na!.upper, 0);
		// Must have Na - Bicarb - Cl < AnionGap.upper - 1
		// So Cl > Na - (Bicarb + AnionGap.upper - 1)
		// Must have Na - Bicarb - Cl > AnionGap.lower + 1
		// So Cl < Na - (Bicarb + AnionGap.lower + 1)
		randGas.abg.Cl = randFloat(
			randGas.abg.Na - (BG.RefRngs.AnionGap!.upper - 1 + randGas.abg.bicarb!),
			randGas.abg.Na - (BG.RefRngs.AnionGap!.lower + 1 + randGas.abg.bicarb!),
			0,
		);
	}
	randGas.abg.Albumin = 4.5;
	return [randGas, disturbList];
}
const upperLimitPaCO2 = 75;
const lowerLimitPaCO2 = 12;
export const abgGenerators: {[disturb: string]: () => [BG.BloodGas, BG.DisturbType[][]]} = {
	"Acute Respiratory Acidosis": () => {
		const newGas = new BG.BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(BG.RefRngs.PaCO2!.upper + 1, upperLimitPaCO2, 0);
		newGas.abg.bicarb = randFloat(BG.RefRngs.aBicarb!.lower, BG.RefRngs.aBicarb!.upper, 0);
		newGas.abg.pH = floatFix(newGas.pHExpected(), 2);
		newGas.abg.Na = randFloat(BG.RefRngs.Na!.lower, BG.RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (BG.RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (BG.RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[BG.DisturbType.RespAcid]]];
	},
	"Acute Respiratory Alkalosis": () => {
		const newGas = new BG.BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(lowerLimitPaCO2, BG.RefRngs.PaCO2!.lower - 1, 0);
		newGas.abg.bicarb = randFloat(BG.RefRngs.aBicarb!.lower, BG.RefRngs.aBicarb!.upper, 0);
		newGas.abg.pH = floatFix(newGas.pHExpected(), 2);
		newGas.abg.Na = randFloat(BG.RefRngs.Na!.lower, BG.RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (BG.RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (BG.RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[BG.DisturbType.RespAlk]]];
	},
	"Chronic Respiratory Acidosis": () => {
		// Adjusted PaCO2
		const newGas = new BG.BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(BG.RefRngs.PaCO2!.upper + 1, upperLimitPaCO2, 0);
		newGas.abg.pH = randFloat(BG.RefRngs.apH!.lower, BG.RefRngMidpoint("apH") + 0.02, 2);
		newGas.abg.bicarb = floatFix(newGas.bicarbExpected(), 0);
		newGas.abg.Na = randFloat(BG.RefRngs.Na!.lower, BG.RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (BG.RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (BG.RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[BG.DisturbType.RespAcid, BG.DisturbType.Compensated], [BG.DisturbType.MetAlk]]];
	},
	"Chronic Respiratory Alkalosis": () => {
		// Adjusted PaCO2
		const newGas = new BG.BloodGas({abg: {}});
		newGas.abg.PaCO2 = randFloat(lowerLimitPaCO2, BG.RefRngs.PaCO2!.lower, 0);
		newGas.abg.pH = randFloat(BG.RefRngMidpoint("apH") - 0.02, BG.RefRngs.apH!.upper, 2);
		newGas.abg.bicarb = floatFix(newGas.bicarbExpected(), 0);
		newGas.abg.Na = randFloat(BG.RefRngs.Na!.lower, BG.RefRngs.Na!.upper, 0);
		newGas.abg.Cl = randFloat(
			newGas.abg.Na - (BG.RefRngs.AnionGap!.upper - 1 + newGas.abg.bicarb!),
			newGas.abg.Na - (BG.RefRngs.AnionGap!.lower + 1 + newGas.abg.bicarb!),
			0,
		);
		return [newGas, [[BG.DisturbType.RespAlk, BG.DisturbType.Compensated], [BG.DisturbType.MetAcid, BG.DisturbType.Hyperchloremic]]];
	},
};
