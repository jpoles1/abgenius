import * as BG from '../../src/components/BloodGas';

describe('BloodGas utilities', () => {
    test('Finding reference range midpoint', () => {
        expect(BG.RefRngMidpoint('apH')).toEqual(7.4);
        expect(() => { BG.RefRngMidpoint('z'); }).toThrow();
    });
    test('Age-based O2 sat compensation', () => {
        const scenario1: BG.BloodGas = new BG.BloodGas({abg: {}});
        expect(scenario1.adjustedPaO2()).toEqual({lower: 80, upper: 100});
        scenario1.abg.patientAge = 24;
        expect(scenario1.adjustedPaO2()).toEqual({lower: 80, upper: 100});
        scenario1.abg.patientAge = 70;
        expect(scenario1.o2Disturbance()).toEqual(BG.DisturbType.Unknown);
        scenario1.abg.PaO2 = 68;
        expect(scenario1.adjustedPaO2()).toEqual({lower: 70, upper: 100});
        expect(scenario1.o2Disturbance()).toBe(BG.DisturbType.Hypoxemia);
        scenario1.abg.PaO2 = 72;
        expect(scenario1.o2Disturbance()).toBe(BG.DisturbType.Normal);
        scenario1.abg.patientAge = 0;
        expect(scenario1.o2Disturbance()).toBe(BG.DisturbType.Hyperoxemia);
    });
    test('Validates ABG values', () => {
        const scenario1: BG.BloodGas = new BG.BloodGas({abg: {}});
        expect(scenario1.realisticABG()).toBe(false);
        expect(scenario1.validABG()).toBe(false);
        scenario1.abg.pH = 7.2;
        expect(scenario1.validABG()).toBe(false);
        scenario1.abg.bicarb = 14;
        expect(scenario1.validABG()).toBe(false);
        scenario1.abg.PaCO2 = 80;
        expect(scenario1.validABG()).toBe(true);
    });
    test('Validates electrolyte values', () => {
        const scenario1: BG.BloodGas = new BG.BloodGas({abg: {}});
        expect(scenario1.validLytes()).toBe(false);
        scenario1.abg.bicarb = 22;
        expect(scenario1.validLytes()).toBe(false);
        scenario1.abg.Cl = 102;
        expect(scenario1.validLytes()).toBe(false);
        scenario1.abg.Na = 142;
        expect(scenario1.validLytes()).toBe(true);
    });
    test('Anion Gap', () => {
        const scenario1: BG.BloodGas = new BG.BloodGas({abg: {}});
        expect(scenario1.serumAnionGap()).toEqual([undefined, BG.DisturbType.Unknown]);
        scenario1.abg = {
            bicarb: 32,
            Na: 145,
            Cl: 105,
        };
        expect(scenario1.serumAnionGap()).toEqual([8, BG.DisturbType.Normal]);
        scenario1.abg.Cl = 95;
        expect(scenario1.serumAnionGap()).toEqual([18, BG.DisturbType.AnionGap]);
    });
    test('Winters Formula', () => {
        const scenario1: BG.BloodGas = new BG.BloodGas({
            abg: {
                pH: 7.25,
                PaCO2: 38,
                bicarb: 16,
            },
        });
        expect(scenario1.wintersFormula()).toEqual({lower: 30, upper: 34});
    });
});

describe('Blood gas scenarios', () => {
    test('Normal Sample', () => {
        const scenario1: BG.BloodGas = new BG.BloodGas({
            abg: {
                pH: 7.4,
                bicarb: 25,
                PaCO2: 40,
                PaO2: 90,
                Na: 140,
                Cl: 102,
                K: 4.3,
            },
        });
        expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Normal);
        expect(scenario1.guessPrimaryDisturbance()).toEqual(BG.DisturbType.Normal);
        expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.Normal, undefined]);
        expect(scenario1.serumAnionGap()).toEqual([17.3, BG.DisturbType.AnionGap]);

    });
    test('pH Disturbances', () => {
        const scenario1: BG.BloodGas = new BG.BloodGas({abg: {}});
        expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Unknown);
        scenario1.abg.pH = 7.46;
        expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Alkalemia);
        scenario1.abg.pH = 7.34;
        expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Acidemia);
        scenario1.abg.pH = 7.36;
        expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Normal);
    });
    test('Resp Alkalosis', () => {
        const scenario1 = new BG.BloodGas({
            abg: {},
        });
        expect(scenario1.guessPrimaryDisturbance()).toEqual(BG.DisturbType.Unknown);
        expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.Unknown, undefined]);
        scenario1.abg = {
            pH: 7.41,
            PaCO2: 27,
            bicarb: 17,
        };
        expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Normal);
        expect(scenario1.guessPrimaryDisturbance()).toEqual(BG.DisturbType.RespAlk);
        expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.MetAcid, BG.DisturbType.Chronic]);
        scenario1.abg.bicarb = 22;
        expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.MetAcid, BG.DisturbType.Acute]);
        scenario1.abg.bicarb = 23;
        expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.MetAcid, undefined]);
        scenario1.abg.bicarb = 30;
        expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.MetAlk, undefined]);
    });
    test('Resp Acidosis', () => {
        const scenario1 = new BG.BloodGas({
            abg: {
                pH: 7.21,
                PaCO2: 98,
                bicarb: 32,
                Na: 145,
                Cl: 105,
            },
        });
        expect(scenario1.realisticABG()).toEqual(true);
        expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Acidemia);
        expect(scenario1.serumAnionGap()).toEqual([8, BG.DisturbType.Normal]);
        expect(scenario1.guessPrimaryDisturbance()).toEqual(BG.DisturbType.RespAcid);
        expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.MetAlk, BG.DisturbType.Acute]);
        scenario1.abg.bicarb = 50;
        expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.MetAlk, BG.DisturbType.Chronic]);
        scenario1.abg.bicarb = 28;
        expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.MetAlk, undefined]);
        scenario1.abg.bicarb = 10;
        expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.MetAcid, undefined]);
    });
    test('Met Acidosis', () => {
        // Primary: Metabolic Acidosis
        // Secondary Respiratory Alkalosis
        // Additional Metabolic Alkalosis.
        const scenario1 = new BG.BloodGas({
            abg: {
                pH: 7.21,
                PaCO2: 24,
                bicarb: 20,
                Na: 140,
                Cl: 102,
            },
        });
        expect(scenario1.realisticABG()).toEqual(true);
        expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Acidemia);
        expect(scenario1.serumAnionGap()).toEqual([18, BG.DisturbType.AnionGap]);
        expect(scenario1.guessPrimaryDisturbance()).toEqual(BG.DisturbType.MetAcid);
        expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.RespAlk, undefined]);
    });
    test('Met Alkalosis', () => {
        const scenario1 = new BG.BloodGas({
            abg: {
                pH: 7.55,
                PaCO2: 50,
                bicarb: 40,
                Na: 140,
                Cl: 102,
            },
        });
        expect(scenario1.realisticABG()).toEqual(true);
        expect(scenario1.phDisturbance()).toEqual(BG.DisturbType.Alkalemia);
        expect(scenario1.guessPrimaryDisturbance()).toEqual(BG.DisturbType.MetAlk);
        expect(scenario1.guessSecondaryDisturbance()).toEqual([BG.DisturbType.RespAcid, undefined]);
    });
});
