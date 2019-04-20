// Laboratory Reference Ranges
interface RefRange {
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
};

// Patient Characteristic Enums
enum BiologicalSex {
  Male,
  Female,
}
export enum DisturbType {
  MetAcid = 'Metabolic Acidosis',
  RespAcid = 'Respiratory Acidosis',
  MetAlk = 'Metabolic Alkalosis',
  RespAlk = 'Respiratory Alkaolosis',
  Unknown = 'Unknown',
}
// Lab Panel Types
export interface ABGResult {
  pH?: number;
  bicarb?: number;
  PaCO2?: number;
}
// BloodGas stores the information regarding a patient and their ABG values
export class BloodGas {
  public patientAge?: number;
  public patientSex?: BiologicalSex;
  public abg: ABGResult = {};
  public validABG(): boolean {
    return this.abg.pH !== undefined && this.abg.bicarb !== undefined && this.abg.PaCO2 !== undefined;
  }
  public guessPrimaryDisturbance(): DisturbType {
    if (this.validABG) {
      if (this.abg.pH! > RefRngs['Arterial pH']!.upper) {
        if (this.abg.PaCO2! > RefRngs.PaCO2!.upper) return DisturbType.MetAlk;
        if (this.abg.PaCO2! < RefRngs.PaCO2!.lower) return DisturbType.RespAlk;
      }
      if (this.abg.pH! < RefRngs['Arterial pH']!.lower) {
        if (this.abg.PaCO2! > RefRngs.PaCO2!.upper) return DisturbType.RespAcid;
        if (this.abg.PaCO2! < RefRngs.PaCO2!.lower) return DisturbType.MetAcid;
      }
    }
    return DisturbType.Unknown;
  }
  public serumAnionGap(concNa: number, concCl: number, concBicarb: number): number {
    return concNa - (concCl + concBicarb);
  }
  public wintersFormula(bicarb: number): [number, number] {
    const lowerLimit = (1.5 * bicarb) + 8 - 2;
    const upperLimit = (1.5 * bicarb) + 8 + 2;
    return [lowerLimit, upperLimit];
  }
}
