// Laboratory Reference Ranges
interface RefRange {
  upper: number;
  lower: number;
}
// Patient Characteristic Enums
enum BiologicalSex {
  Male,
  Female,
}
enum DisturbType {
  MetAcid = 'Metabolic Acidosis',
  RespAcid = 'Respiratory Acidosis',
  MetAlk = 'Metabolic Alkalosis',
  RespAlk = 'Respiratory Alkaolosis',
}
// Lab Panel Types
interface ABGResult {
  pH?: number;
  bicarb?: number;
  PaCO2?: number;
}

// BloodGas stores the information regarding a patient and their ABG values
export class BloodGas {
  public patientAge?: number;
  public patientSex?: BiologicalSex;
  public abg: ABGResult = {};
  public refRngs: { [testName: string]: RefRange | undefined } = {
    'Arterial pH': {lower: 7.35, upper: 7.45},
    'Venous pH': {lower: 7.31, upper: 7.41},
  };
  public validABG(): boolean {
    return this.abg.pH !== undefined && this.abg.bicarb !== undefined && this.abg.PaCO2 !== undefined;
  }
  public guessPrimaryDisturbance(bg: BloodGas): DisturbType | undefined {
    if (this.validABG) {
      if (this.abg.pH! > this.refRngs['Arterial pH']!.upper) {
        if (this.abg.PaCO2! > this.refRngs.PaCO2!.upper) return DisturbType.MetAlk;
        if (this.abg.PaCO2! < this.refRngs.PaCO2!.lower) return DisturbType.RespAlk;
      }
      if (this.abg.pH! < this.refRngs['Arterial pH']!.lower) {
        if (this.abg.PaCO2! > this.refRngs.PaCO2!.upper) return DisturbType.RespAcid;
        if (this.abg.PaCO2! < this.refRngs.PaCO2!.lower) return DisturbType.MetAcid;
      }
    }
    return undefined;
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
