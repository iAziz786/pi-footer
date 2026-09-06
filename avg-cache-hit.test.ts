import { describe, expect, test } from "bun:test";
import { computeAvgCacheHitRate } from "./cache-hit.ts";

describe("computeAvgCacheHitRate", () => {
	test("no prompt tokens → undefined", () => {
		expect(computeAvgCacheHitRate({ input: 0, cacheRead: 0, cacheWrite: 0 })).toBeUndefined();
	});

	test("single turn ratio", () => {
		// 9800 read of 10000 prompt → 98
		expect(computeAvgCacheHitRate({ input: 200, cacheRead: 9800, cacheWrite: 0 })).toBe(98);
	});

	test("weights by tokens, not mean of turns", () => {
		// Small 100% turn + large 0% turn: mean says 50, weighted says 10.
		expect(computeAvgCacheHitRate({ input: 9000, cacheRead: 1000, cacheWrite: 0 })).toBe(10);
	});

	test("cache write counts as prompt, not hit", () => {
		// 5000 read of 10000 prompt (rest write) → 50
		expect(computeAvgCacheHitRate({ input: 0, cacheRead: 5000, cacheWrite: 5000 })).toBe(50);
	});

	test("prompt with no cache activity → 0", () => {
		expect(computeAvgCacheHitRate({ input: 10000, cacheRead: 0, cacheWrite: 0 })).toBe(0);
	});

	test("full read → 100", () => {
		expect(computeAvgCacheHitRate({ input: 0, cacheRead: 10000, cacheWrite: 0 })).toBe(100);
	});
});
