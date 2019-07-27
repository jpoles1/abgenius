import { arrayEq } from "@/util";

describe("Utility functions", () => {
	test("Array deep-equality", () => {
		expect(arrayEq(["test1", "test2"], ["test1"])).toBe(false);
		expect(arrayEq(["test1"], ["test2"])).toBe(false);
		expect(arrayEq(["test1", "test2"], ["test1", "test2"])).toBe(true);
	});
});
