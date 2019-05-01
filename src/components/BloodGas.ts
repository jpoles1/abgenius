// Laboratory Reference Ranges
export interface RefRange {
  upper: number;
  lower: number;
}
export function RefRngMidpoint(testName: string): number {
  if (RefRngs[testName] === undefined) throw new Error('Invalid reference range key!');
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
  Acute = 'Acute',
  Chronic = 'Chronic',
  Acidemia = 'Acidemia',
  Alkalemia = 'Alkalemia',
  Hypoxemia = 'Hypoxemia',
  Hyperoxemia = 'Hyperoxemia',
  MetAcid = 'Metabolic Acidosis',
  RespAcid = 'Respiratory Acidosis',
  MetAlk = 'Metabolic Alkalosis',
  RespAlk = 'Respiratory Alkalosis',
  AnionGap = 'Anion Gap',
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
  public pHExpected(): number {
    return 6.1 + Math.log10(this.abg.bicarb! / (0.03 * this.abg.PaCO2!));
  }
  public realisticABG(): boolean {
    if (!this.validABG()) return false;
    const tolerance = 0.4;
    // does not account for anion gap?
    return this.pHExpected().between(this.abg.pH! - tolerance, this.abg.pH! + tolerance);
  }
  public validLytes(): boolean {
    return this.abg.Na !== undefined && this.abg.bicarb !== undefined && this.abg.Cl !== undefined;
  }
  public phDisturbance(): DisturbType {
    if (this.abg.pH === undefined) return DisturbType.Unknown;
    if (this.abg.pH! > RefRngs.apH!.upper) return DisturbType.Alkalemia;
    if (this.abg.pH! < RefRngs.apH!.lower) return DisturbType.Acidemia;
    return DisturbType.Normal;
  }
  public guessPrimaryDisturbance(): DisturbType {
    const pHmidpoint = RefRngMidpoint('apH');
    if (this.validABG() && pHmidpoint) {
      if (this.abg.pH! >= pHmidpoint) {
        if (this.abg.PaCO2! > RefRngs.PaCO2!.upper) return DisturbType.MetAlk;
        else if (this.abg.PaCO2! < RefRngs.PaCO2!.lower) return DisturbType.RespAlk;
      } else if (this.abg.pH! < pHmidpoint) {
        if (this.abg.PaCO2! > RefRngs.PaCO2!.upper) return DisturbType.RespAcid;
        else if (this.abg.PaCO2! < RefRngs.PaCO2!.lower) return DisturbType.MetAcid;
      }
    }
    return DisturbType.Unknown;
  }
  public expectedBicarb = (adjFactor: number): number => {
    return RefRngMidpoint('aBicarb') + (adjFactor * (this.abg.PaCO2! - RefRngMidpoint('PaCO2')!));
  }
  public guessSecondaryDisturbance(): [DisturbType, DisturbType | undefined] {
    if (this.validABG()) {
      const primaryDisturbance = this.guessPrimaryDisturbance();

      if (primaryDisturbance === DisturbType.RespAlk) {
        // Check if observed bicarb is in range expected for chronic compensation.
        if (this.abg.bicarb! < this.expectedBicarb(0.5)) {
          return [DisturbType.MetAcid, DisturbType.Chronic];
        }
        if (this.abg.bicarb! < this.expectedBicarb(0.2)) {
          return [DisturbType.MetAcid, DisturbType.Acute];
        }
        if (this.abg.bicarb! >= RefRngMidpoint('aBicarb')) {
          return [DisturbType.MetAlk, undefined];
        }
        return [DisturbType.MetAcid, undefined];
      }
      if (primaryDisturbance === DisturbType.RespAcid) {
        // Check if observed bicarb is in range expected for chronic compensation.
        if (this.abg.bicarb! > this.expectedBicarb(0.35)) {
          return [DisturbType.MetAlk, DisturbType.Chronic];
        }
        if (this.abg.bicarb! > this.expectedBicarb(0.1)) {
          return [DisturbType.MetAlk, DisturbType.Acute];
        }
        if (this.abg.bicarb! <= RefRngMidpoint('aBicarb')) {
          return [DisturbType.MetAcid, undefined];
        }
        return [DisturbType.MetAlk, undefined];
      }
      if (primaryDisturbance === DisturbType.MetAlk) {
        const compensatedPaCO2 = 40 + (0.6 * (this.abg.bicarb! - 25)) ;
        if (this.abg.PaCO2! < compensatedPaCO2) return [DisturbType.RespAlk, undefined];
        if (this.abg.PaCO2! >= RefRngMidpoint('PaCO2')) return [DisturbType.RespAcid, undefined];
      }
      if (primaryDisturbance === DisturbType.MetAcid) {
        const compensatedPaCO2 = this.wintersFormula();
        if (this.abg.PaCO2! > compensatedPaCO2.lower) return [DisturbType.RespAcid, undefined];
        if (this.abg.PaCO2! <= RefRngMidpoint('PaCO2')) return [DisturbType.RespAlk, undefined];
      }
      return [DisturbType.Normal, undefined];
    }
    return [DisturbType.Unknown, undefined];
  }
  public serumAnionGap(): [number | undefined, DisturbType] {
    if (!this.validLytes()) return [undefined, DisturbType.Unknown];
    const anionGap = this.abg.Na! - (this.abg.Cl! + this.abg.bicarb!) + (this.abg.K ? this.abg.K : 0);
    if (anionGap > 14) return [anionGap, DisturbType.AnionGap];
    return [anionGap, DisturbType.Normal];
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
    if (this.abg.patientAge.between(0, 1)) return {lower: 40, upper: 70};
    // Elderly: Subtract 1 mm Hg from the minimal 80 mm Hg level for every year over 60 years of age:  80 – (age- 60)
    if (this.abg.patientAge >= 60 && this.abg.patientAge < 90) {
      const adjLowerBound = 80 - (this.abg.patientAge - 60);
      return {lower: Math.max(adjLowerBound, 55), upper: RefRngs.PaO2!.upper};
    }
    return RefRngs.PaO2!;
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

