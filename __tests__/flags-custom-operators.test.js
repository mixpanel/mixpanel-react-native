/**
 * Tests for the custom JsonLogic operators (semver_compare, datetime_compare).
 *
 * Port of ~/mixpanel-js/tests/unit/custom-operators.js. The golden vectors in test-data/ are the
 * cross-SDK contract for these operators; the canonical copy and its README live in the analytics
 * monorepo. Cases run through jsonLogic.apply so that operator registration is covered alongside
 * the comparison itself.
 */

import fs from "fs";
import path from "path";
import jsonLogic from "json-logic-js";

import { registerCustomOperators } from "../javascript/mixpanel-custom-operators";
import { eventMatchesCriteria } from "../javascript/mixpanel-flags-js";

// Jest resets the module registry per test file, so this suite registers against its own
// json-logic-js instance rather than relying on mixpanel-flags-js having done it.
registerCustomOperators(jsonLogic);

const TEST_DATA = path.join(__dirname, "test-data");

// 2026-07-16T00:00:00Z, as epoch milliseconds.
const JUL16_MS = 1784160000000;

// The property key the vectors are evaluated against. It is plumbing the test supplies, so any name
// works as long as the rule and the data agree on it.
const VECTOR_KEY = "value";

function varNode(key) {
  return { var: key };
}

function semverRule(key, sym, target) {
  return { semver_compare: [varNode(key), sym, target] };
}

function datetimeRule(key, sym, target) {
  return { datetime_compare: [varNode(key), sym, target] };
}

// Build the event the rule reads from, omitting the key entirely for an unset property.
function dataFor(subject) {
  const data = {};
  if (subject !== null) {
    data[VECTOR_KEY] = subject;
  }
  return data;
}

// Read a golden-vector file. String entries are headings, array entries are cases.
function loadVectors(operator, buildRule) {
  const entries = JSON.parse(
    fs.readFileSync(path.join(TEST_DATA, `${operator}_compare_tests.json`), "utf8")
  );

  let section = "";
  const cases = [];
  entries.forEach((entry, index) => {
    if (typeof entry === "string") {
      section = entry;
      return;
    }
    const [subject, symbol, target, want] = entry;
    cases.push({
      name: `${index} ${section}: ${JSON.stringify(subject)} ${symbol} ${JSON.stringify(target)}`,
      rule: buildRule(VECTOR_KEY, symbol, target),
      data: dataFor(subject),
      want,
    });
  });
  return cases;
}

// Asserts against the raw jsonLogic.apply result rather than going through eventMatchesCriteria,
// which coerces with !! and would mask a truthy-but-not-boolean regression.
function runCases(cases) {
  test.each(cases)("$name", ({ rule, data, want }) => {
    expect(jsonLogic.apply(rule, data)).toBe(want);
  });
}

describe("custom JsonLogic operators", () => {
  describe("semver_compare", () => {
    runCases(loadVectors("semver", semverRule));
  });

  describe("datetime_compare", () => {
    runCases(loadVectors("datetime", datetimeRule));
  });

  // An unset property must produce an event with no key at all, rather than a key holding a null.
  // Both spellings fail closed, so the vectors alone cannot tell them apart.
  it("omits the property for an unset subject", () => {
    expect(dataFor(null)).toEqual({});
    expect(dataFor("1.2.3")).toEqual({ value: "1.2.3" });
  });

  // Hermes ships its own ISO date parser rather than V8's lenient fallback, and ECMAScript only
  // specifies three fractional-second digits. These are the vectors that sit in that gap; they fail
  // closed (never activating a flag) rather than throwing, so call them out separately.
  describe("sub-second precision", () => {
    const cases = [
      "2026-07-16T00:00:00.0Z",
      "2026-07-16T00:00:00.5Z",
      "2026-07-16T00:00:00.123456Z",
      "2026-07-16T00:00:00.999999999Z",
    ];
    it.each(cases)("parses %s and drops the fraction", (subject) => {
      expect(jsonLogic.apply(datetimeRule(VECTOR_KEY, "===", JUL16_MS), dataFor(subject))).toBe(true);
    });

    it("floors toward negative infinity for a pre-epoch subject", () => {
      const rule = datetimeRule(VECTOR_KEY, "===", -2000);
      expect(jsonLogic.apply(rule, dataFor("1969-12-31T23:59:58.500Z"))).toBe(true);
    });
  });

  // Driven through the shipping module's own eventMatchesCriteria, so these double as proof that
  // mixpanel-flags-js registered the operators on import.
  describe("eventMatchesCriteria integration", () => {
    it("matches a semver property filter", () => {
      const criteria = {
        event_name: "Signup",
        property_filters: semverRule("app_version", ">=", "1.2.3"),
      };
      expect(eventMatchesCriteria("Signup", { app_version: "1.5.0" }, criteria).matches).toBe(true);
      expect(eventMatchesCriteria("Signup", { app_version: "1.0.0" }, criteria).matches).toBe(false);
    });

    it("matches a datetime property filter with an RFC3339 subject", () => {
      const criteria = {
        event_name: "Signup",
        property_filters: datetimeRule("signup", "<", JUL16_MS),
      };
      expect(eventMatchesCriteria("Signup", { signup: "2026-07-15T00:00:00Z" }, criteria).matches).toBe(true);
      expect(eventMatchesCriteria("Signup", { signup: "2026-07-17T00:00:00Z" }, criteria).matches).toBe(false);
    });

    it("fails closed on an unparseable semver subject", () => {
      const criteria = {
        event_name: "Signup",
        property_filters: semverRule("app_version", "===", "1.2.3"),
      };
      const result = eventMatchesCriteria("Signup", { app_version: "not-a-version" }, criteria);
      expect(result.matches).toBe(false);
      // Fails closed rather than throwing -- an error here means registration regressed.
      expect(result.error).toBeUndefined();
    });
  });
});
