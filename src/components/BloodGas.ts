// Laboratory Reference Ranges
export interface RefRange {
  upper: number;
  lower: number;
}
export function RefRngMidpoint(testName: string): number | undefined {
  if (RefRngs[testName] === undefined) return undefined;
  if (RefRngs[testName]!.lower === undefined && RefRngs[testName]!.upper === undefined) return undefined;
  return (RefRngs[testName]!.lower + RefRngs[testName]!.upper) / 2;
}

export const RefRngs: { [testName: string]: RefRange | undefined } = {
  // Arterial and Venous pH
  'apH': {lower: 7.35, upper: 7.45},
  'vpH': {lower: 7.31, upper: 7.42},
  'PaO2': {lower: 80, upper: 100},
  'PvO2': {lower: 28, upper: 48},
  'aBicarb': {lower: 22, upper: 28},
  'vBicarb': {lower: 19, upper: 25},
  'PaCO2': {lower: 35, upper: 45},
  'PvCO2': {lower: 38, upper: 52},
  'SaO2': {lower: 95, upper: 100},
  'SvO2': {lower: 50, upper: 70},
  'Na': {lower: 135, upper: 145},
  'K': {lower: 3.5, upper: 5.1},
  'Cl': {lower: 98, upper: 106},
  'Albumin': {lower: 3.5, upper: 5.5}, // in g/dL
};

// Patient Characteristic Enums
enum BiologicalSex {
  Male,
  Female,
}
export enum DisturbType {
  Normal = 'Normal',
  Acidemia = 'Acidemia',
  Alkalemia = 'Alkalemia',
  Hypoxemia = 'Hypoxemia',
  Hyperoxemia = 'Hyperoxemia',
  MetAcid = 'Metabolic Acidosis',
  RespAcid = 'Respiratory Acidosis',
  MetAlk = 'Metabolic Alkalosis',
  RespAlk = 'Respiratory Alkaolosis',
  Unknown = 'Unknown',
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
// BloodGas stores the information regarding a patient and their ABG values
export class BloodGas {
  public abg: ABGResults = {};
  public constructor(init?: Partial<BloodGas>) {
      Object.assign(this, init);
  }
  public validABG(): boolean {
    return this.abg.pH !== undefined && this.abg.bicarb !== undefined && this.abg.PaCO2 !== undefined;
  }
  public phDisturbance(): DisturbType {
    if (!this.validABG()) return DisturbType.Unknown;
    if (this.abg.pH! > RefRngs.apH!.upper) return DisturbType.Alkalemia;
    if (this.abg.pH! < RefRngs.apH!.lower) return DisturbType.Acidemia;
    return DisturbType.Normal;
  }
  public guessPrimaryDisturbance(): DisturbType {
    if (this.validABG()) {
      if (this.abg.pH! > RefRngs.apH!.upper) {
        if (this.abg.PaCO2! > RefRngs.PaCO2!.upper) return DisturbType.MetAlk;
        if (this.abg.PaCO2! < RefRngs.PaCO2!.lower) return DisturbType.RespAlk;
      }
      if (this.abg.pH! < RefRngs.apH!.lower) {
        if (this.abg.PaCO2! > RefRngs.PaCO2!.upper) return DisturbType.RespAcid;
        if (this.abg.PaCO2! < RefRngs.PaCO2!.lower) return DisturbType.MetAcid;
      }
    }
    return DisturbType.Unknown;
  }
  public guessSecondaryDisturbance(): DisturbType {
    if (this.validABG()) {
      const compensatedPaCO2 = this.wintersFormula();
      const primaryDisturbance = this.guessPrimaryDisturbance();
      if (primaryDisturbance === DisturbType.MetAlk) {
        if (this.abg.PaCO2! > compensatedPaCO2.lower) return DisturbType.RespAcid;
      }
    }
    return DisturbType.Unknown;
  }
  public serumAnionGap(concNa: number, concCl: number, concBicarb: number): number {
    return concNa - (concCl + concBicarb);
  }
  public wintersFormula(): RefRange {
    const lowerLimit = (1.5 * this.abg.bicarb!) + 8 - 2;
    const upperLimit = (1.5 * this.abg.bicarb!) + 8 + 2;
    return {lower: lowerLimit, upper: upperLimit};
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
    if (this.abg.patientAge <= 1 && this.abg.patientAge > 0) return {lower: 40, upper: 70};
    // Elderly: Subtract 1 mm Hg from the minimal 80 mm Hg level for every year over 60 years of age:  80 – (age- 60)
    if (this.abg.patientAge >= 60) {
      const adjLowerBound = 80 - (this.abg.patientAge - 60);
      return {lower: adjLowerBound, upper: RefRngs.PaO2!.upper};
    }
    return RefRngs.PaO2!;
  }
}
