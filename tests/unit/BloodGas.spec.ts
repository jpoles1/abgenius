import * as BG from '../../src/components/BloodGas';

const scenario1: BG.BloodGas = new BG.BloodGas({
    abg: {
        patientAge: 70,
        pH: 7.25,
        PaCO2: 38,
        PaO2: 72,
        bicarb: 16,
    },
});
test('Age-based O2 sat compensation', () => {
    expect(scenario1.adjustedPaO2()).toEqual({lower: 70, upper: 100});
    expect(scenario1.o2Disturbance()).toBe(BG.DisturbType.Normal);
});
test('Winters Formula', () => {
    expect(scenario1.wintersFormula()).toEqual({lower: 30, upper: 34});
});
