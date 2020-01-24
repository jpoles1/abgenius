import * as BG from "../../src/components/BloodGas";
import * as GenBG from "../../src/components/BloodGasGen";

describe("BloodGas utilities", () => {
	const testsPerRule = 1000;
	Object.keys(GenBG.abgGenerators).map((ruleName) => {
		test("Rule-based ABG generation: " + ruleName, () => {
			[...Array(testsPerRule)].map(() => {
				const testABG = GenBG.abgGenerators[ruleName](false);
				expect(testABG[0].validABG()).toBe(true);
				expect(testABG[0].validLytes()).toBe(true);
				expect(testABG[0].realisticABG()).toBe(true);
				const disturbGuess = testABG[0].guessDisturbances();
				expect(disturbGuess[0].sort()).toEqual(testABG[1].sort());
				expect(disturbGuess[1]).toEqual(testABG[2]);
			});
			/*expect([...Array(testsPerRule)].map(() => {
				const testABG = GenBG.abgGenerators[ruleName]();
				return JSON.stringify(testABG[0].guessDisturbances()) === JSON.stringify(testABG[1]);
			}).filter((x) => x === true).length).toBe(testsPerRule);*/
		});
	});
});
