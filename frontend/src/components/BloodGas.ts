// Laboratory Reference Ranges
export interface RefRange {
	upper: number;
	lower: number;
}
export function RefRngMidpoint(testName: string): number {
	if (RefRngs[testName] === undefined) throw new Error("Invalid reference range key!");
	return (RefRngs[testName]!.lower + RefRngs[testName]!.upper) / 2;
}

export const RefRngs: { [testName: string]: RefRange | undefined } = {
	// Arterial and Venous pH
	"apH": {lower: 7.35, upper: 7.45},
	"vpH": {lower: 7.31, upper: 7.42},
	// Arterial and Venous O2
	"PaO2": {lower: 80, upper: 100},
	"PvO2": {lower: 28, upper: 48},
	"aBicarb": {lower: 22, upper: 28},
	"vBicarb": {lower: 19, upper: 25},
	"PaCO2": {lower: 35, upper: 45},
	"PvCO2": {lower: 38, upper: 52},
	"SaO2": {lower: 95, upper: 100},
	"SvO2": {lower: 50, upper: 70},
	"Na": {lower: 135, upper: 145},
	"K": {lower: 3.5, upper: 5.1},
	"Cl": {lower: 98, upper: 106},
	"Albumin": {lower: 3.5, upper: 5.5}, // in g/dL
	"aLactate": {lower: 0.5, upper: 1.5},
	"aLactateCrit": {lower: 0.5, upper: 2},
	// (Kellum, 2005)
	"AnionGap": {lower: 4, upper: 12},
	"DeltaGap": {lower: -6, upper: 6},
};

// Patient Characteristic Enums
enum BiologicalSex {
	Male,
	Female,
}

export enum DisturbType {
	Normal = "Normal",
	Chronic = "Chronic",
	Acidemia = "Acidemia",
	Alkalemia = "Alkalemia",
	Hypoxemia = "Hypoxemia",
	Hyperoxemia = "Hyperoxemia",
	MetAcid = "Metabolic Acidosis",
	RespAcid = "Respiratory Acidosis",
	MetAlk = "Metabolic Alkalosis",
	RespAlk = "Respiratory Alkalosis",
	AnionGap = "Anion Gap",
	DeltaGap = "Delta Gap",
	Unknown = "Unknown",
	CompleteComp = "Complete Compensation",
}

export interface Gap {
	disturb: DisturbType;
	gap: number;
}

// Lab Panel Types
export interface ABGResults {
	// Demographics
	patientAge?: number;
	patientSex?: BiologicalSex;
	// ABG
	pH?: number;
	bicarb?: number;
	PaO2?: number;
	PaCO2?: number;
	// Electrolytes
	Na?: number;
	K?: number;
	Cl?: number;
	Albumin?: number;
	Lactate?: number;
}

// ABGAnswer stores information regarding a user's interpretation of a given ABG.
export interface ABGAnswer {
	abg: BloodGas;
	learner: DisturbType[];
	genius: DisturbType[];
	timeElapsed: number;
	peekedAtGaps: boolean;
	grade: number;
}

// BloodGas stores the information regarding a patient and their ABG values
export class BloodGas {
	public abg: ABGResults = {};
	public constructor(init?: Partial<BloodGas>) {
			Object.assign(this, init);
	}
	public validABG(): boolean {
		function isValid(x: number | undefined) {
			return x !== undefined && isFinite(x) && x > 0;

		}
		return isValid(this.abg.bicarb) && isValid(this.abg.pH) && isValid(this.abg.PaCO2);
	}
	public pHExpected(): number {
		return 6.1 + Math.log10(this.abg.bicarb! / (0.03 * this.abg.PaCO2!));
	}
	public co2Expected(): number {
		return (1 / 3) * this.abg.bicarb! * Math.pow(10, (81 / 10) - this.abg.pH!);
	}
	public bicarbExpected(): number {
		return 3 * this.abg.PaCO2! * Math.pow(10, this.abg.pH! - (81 / 10));
	}
	public realisticABG(): boolean {
		if (!this.validABG()) return false;
		const tolerance = 0.05;
		// does not account for anion gap?
		return this.pHExpected().between(this.abg.pH! - tolerance, this.abg.pH! + tolerance);
	}
	public validLytes(): boolean {
		function isValid(x: number | undefined) {
			return x !== undefined && isFinite(x) && x > 0;

		}
		return isValid(this.abg.Na) && isValid(this.abg.bicarb) && isValid(this.abg.Cl);
	}
	public phDisturbance(): DisturbType {
		if (this.abg.pH === undefined) return DisturbType.Unknown;
		if (this.abg.pH! > RefRngs.apH!.upper) return DisturbType.Alkalemia;
		if (this.abg.pH! < RefRngs.apH!.lower) return DisturbType.Acidemia;
		return DisturbType.Normal;
	}
	// Adj factor for Respiratory Alkalosis = -1/2
	// Adj factor for Respiratory Acidosis = 1/3
	public compensatedBicarb(): number {
		const adjFactor = (this.abg.PaCO2! > RefRngMidpoint("PaCO2")) ? (1 / 3) : (1 / 2);
		return RefRngMidpoint("aBicarb") + (adjFactor * (this.abg.PaCO2! - RefRngMidpoint("PaCO2")!));
	}
	public wintersFormula(): RefRange {
		const lowerLimit = (1.5 * this.abg.bicarb!) + 8 - 2;
		const upperLimit = (1.5 * this.abg.bicarb!) + 8 + 2;
		return {lower: lowerLimit, upper: upperLimit};
	}
	public compensatedPaCO2(): number {
		if (this.abg.bicarb! > RefRngMidpoint("aBicarb")) {
			return (0.7 * this.abg.bicarb!) + 20;
		} else {
			return (1.5 * this.abg.bicarb!) + 8;
		}
	}
	public serumAnionGap(): Gap {
		if (!this.validLytes()) return {disturb: DisturbType.Unknown, gap: NaN};
		const anionGap = this.abg.Na! - (this.abg.Cl! + this.abg.bicarb!);
		if (anionGap > RefRngs.AnionGap!.upper) return {disturb: DisturbType.AnionGap, gap: anionGap};
		if (anionGap < RefRngs.AnionGap!.lower) return {disturb: DisturbType.AnionGap, gap: anionGap};
		return {disturb: DisturbType.Normal, gap: anionGap};
	}
	public serumDeltaGap(): Gap {
		// Ref: Wrenn, K. (1990). The delta (Δ) gap: An approach to mixed acid-base disorders. Annals of emergency medicine.
		if (!this.validLytes()) return {disturb: DisturbType.Unknown, gap: NaN};
		const deltaAnionGap = this.serumAnionGap().gap - RefRngs.AnionGap!.upper;
		const deltaBicarb = RefRngs.aBicarb!.lower - this.abg.bicarb!;
		const deltaGap = deltaAnionGap - deltaBicarb;
		if (Math.abs(deltaGap) > RefRngs.DeltaGap!.upper) return {disturb: DisturbType.DeltaGap, gap: deltaGap};
		return {gap: deltaGap, disturb: DisturbType.Normal};
	}
	public o2Disturbance(): DisturbType {
		if (this.abg.PaO2 === undefined) return DisturbType.Unknown;
		const o2RefRange = this.adjustedPaO2();
		if (this.abg.PaO2 < o2RefRange.lower) return DisturbType.Hypoxemia;
		if (this.abg.PaO2 > o2RefRange.upper) return DisturbType.Hyperoxemia;
		return DisturbType.Normal;
	}
	public adjustedPaO2(): RefRange {
		if (this.abg.patientAge === undefined) return RefRngs.PaO2!;
		// New Born – Acceptable range 40-70 mm Hg.
		if (this.abg.patientAge === 0) return {lower: 40, upper: 70};
		// Elderly: Subtract 1 mm Hg from the minimal 80 mm Hg level for every year over 60 years of age:  80 – (age- 60)
		if (this.abg.patientAge >= 60 && this.abg.patientAge < 90) {
			const adjLowerBound = 80 - (this.abg.patientAge - 60);
			return {lower: Math.max(adjLowerBound, 55), upper: RefRngs.PaO2!.upper};
		}
		return RefRngs.PaO2!;
	}
	public guessDisturbances(): DisturbType[] {
		const disturbList: DisturbType[] = [];
		// Do we have a valid ABG: pH, PaCO2, HCO3
		// Do we have the required electrolytes: Na, Cl, HCO3
		if (this.validABG() && this.validLytes()) {
			// Do we have a low bicarb, or an anion gap?
			if (this.serumAnionGap().gap > RefRngs.AnionGap!.upper) {
				// Do we have an anion gap?
				if (this.serumAnionGap().disturb === DisturbType.AnionGap) {
					// We have an anion gap metabolic acidosis
					disturbList.push(DisturbType.AnionGap);
					// Do we have a delta gap?
					if (this.serumDeltaGap().gap > RefRngs.DeltaGap!.upper) {
						// We have a superimposed metabolic alkalosis
						// Rise in AG is more than fall in HCO3
						disturbList.push(DisturbType.MetAlk);
					} else if (this.serumDeltaGap().gap < RefRngs.DeltaGap!.lower) {
						// We have a superimposed non-gap, hyperchloremic metabolic acidosis
						// Rise in AG is less than fall in HCO3
						disturbList.push(DisturbType.MetAcid);
					} else {
						if (this.abg.PaCO2! <= this.compensatedPaCO2() + 2) {
							disturbList.push(DisturbType.CompleteComp);
						}
					}
				}
			} else if (this.abg.pH! > RefRngMidpoint("apH")) {
				if (this.abg.bicarb! > RefRngs["aBicarb"]!.upper) {
					disturbList.push(DisturbType.MetAlk);
					if (this.abg.PaCO2! >= this.compensatedPaCO2() - 2) {
						disturbList.push(DisturbType.CompleteComp);
					}
				} else if (this.abg.PaCO2! < RefRngs["PaCO2"]!.lower) {
					disturbList.push(DisturbType.RespAlk);
					if (this.abg.bicarb! <= this.compensatedBicarb() + 2) {
						disturbList.push(DisturbType.CompleteComp);
					}
				}
			} else {
				if (this.abg.bicarb! < RefRngs["aBicarb"]!.lower) {
					disturbList.push(DisturbType.MetAcid);
					if (this.abg.PaCO2! <= this.compensatedPaCO2() + 2) {
						disturbList.push(DisturbType.CompleteComp);
					}
				} else if (this.abg.PaCO2! > RefRngs["PaCO2"]!.upper) {
					disturbList.push(DisturbType.RespAcid);
					if (this.abg.bicarb! >= this.compensatedBicarb() - 2) {
						disturbList.push(DisturbType.CompleteComp);
					}
				}
			}
		} else {
			disturbList.push(DisturbType.Unknown);
		}
		if (disturbList.length === 0) {
			disturbList.push(DisturbType.Normal);
		}
		return disturbList;
	}
	/*public guessPrimaryDisturbance(): DisturbType | undefined {
		const disturbs = this.guessDisturbances();
		if (!this.validABG() || !this.validLytes() || (this.serumAnionGap().disturb === "Anion Gap" && this.serumDeltaGap().disturb === "Delta Gap")) return undefined;
		if (this.abg.pH! > RefRngMidpoint("apH") ) {
			return disturbs.find((x) => [DisturbType.MetAlk, DisturbType.RespAlk].includes(x));
		} else {
			return disturbs.find((x) => [DisturbType.MetAcid, DisturbType.RespAcid].includes(x));
		}
	}
	public guessCompensation(): DisturbType[] | undefined {
		const disturbs = this.guessDisturbances();
		if (!this.validABG() || !this.validLytes() || (this.serumAnionGap().disturb === "Anion Gap" && this.serumDeltaGap().disturb === "Delta Gap")) return undefined;
		if (this.abg.pH! > RefRngMidpoint("apH") ) {
			return disturbs.find((x) => [DisturbType.MetAcid, DisturbType.RespAcid].includes(x[0]));
		} else {
			return disturbs.find((x) => [DisturbType.MetAlk, DisturbType.RespAlk].includes(x[0]));
		}
	}*/
	public expectedCompensation(): DisturbType | undefined {
		const primaryDisturb = this.guessDisturbances()[0];
		if (primaryDisturb === undefined) return undefined;
		if (primaryDisturb === DisturbType.AnionGap) return DisturbType.RespAlk;
		if (primaryDisturb === DisturbType.MetAcid) return DisturbType.RespAlk;
		if (primaryDisturb === DisturbType.MetAlk) return DisturbType.RespAcid;
		if (primaryDisturb === DisturbType.RespAcid) return DisturbType.MetAlk;
		if (primaryDisturb === DisturbType.RespAlk) return DisturbType.MetAcid;
	}
}

declare global {
	interface Number {
		between(a: number, b: number): boolean;
	}
}
Number.prototype.between = function(a: number, b: number): boolean {
	return this >= Math.min.apply(Math, [a, b]) && this <= Math.max.apply(Math, [a, b]);
};

