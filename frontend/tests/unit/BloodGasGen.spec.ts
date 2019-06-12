import * as BG from "../../src/components/BloodGas";
import * as GenBG from "../../src/components/BloodGasGen";

describe("BloodGas utilities", () => {
	const testsPerRule = 1000;
	Object.keys(GenBG.abgGenerators).map((ruleName) => {
		test("Rule-based ABG generation: " + ruleName, () => {
			[...Array(testsPerRule)].map(() => {
				const testABG = GenBG.abgGenerators[ruleName]();
				expect(testABG[0].guessDisturbances().sort()).toEqual(testABG[1].sort());
			});
			/*expect([...Array(testsPerRule)].map(() => {
				const testABG = GenBG.abgGenerators[ruleName]();
				return JSON.stringify(testABG[0].guessDisturbances()) === JSON.stringify(testABG[1]);
			}).filter((x) => x === true).length).toBe(testsPerRule);*/
		});
	});
});
