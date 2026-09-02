/*
 * Bittorrent Client using Qt and libtorrent.
 * Copyright (C) 2025  Mike Tzou (Chocobo1)
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * In addition, as a special exception, the copyright holders give permission to
 * link this program with the OpenSSL project's "OpenSSL" library (or with
 * modified versions of it that use the same license as the "OpenSSL" library),
 * and distribute the linked executables. You must obey the GNU General Public
 * License in all respects for all of the code used other than "OpenSSL".  If you
 * modify file(s), you may extend this exception to your version of the file(s),
 * but you are not obligated to do so. If you do not wish to do so, delete this
 * exception statement from your version.
 */

import { expect, test, vi } from "vitest";

import "../../private/scripts/misc.js";

test("Test isHttpUrl()", () => {
    const isHttpUrl = window.qBittorrent.Misc.isHttpUrl;

    expect(isHttpUrl("http://example.com")).toBe(true);
    expect(isHttpUrl("https://example.com/path?a=b#c")).toBe(true);
    expect(isHttpUrl("HTTPS://EXAMPLE.COM")).toBe(true);
    expect(isHttpUrl("  https://example.com  ")).toBe(true);
    // relative URLs are resolved against the document URL
    expect(isHttpUrl("")).toBe(true);
    expect(isHttpUrl("/foo")).toBe(true);

    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("JavaScript:alert(1)")).toBe(false);
    expect(isHttpUrl("  javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("java\tscript:alert(1)")).toBe(false);
    expect(isHttpUrl("java\nscript:alert(1)")).toBe(false);
    expect(isHttpUrl("java\rscript:alert(1)")).toBe(false);
    expect(isHttpUrl("vbscript:msgbox(1)")).toBe(false);
    expect(isHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isHttpUrl("blob:https://example.com/1234")).toBe(false);
    expect(isHttpUrl("file:///etc/passwd")).toBe(false);
    expect(isHttpUrl("ftp://example.com")).toBe(false);
    expect(isHttpUrl("mailto:someone@example.com")).toBe(false);
    expect(isHttpUrl("magnet:?xt=urn:btih:0000000000000000000000000000000000000000")).toBe(false);
});

test("Test filterInPlace()", () => {
    const filterInPlace = (array, predicate) => {
        window.qBittorrent.Misc.filterInPlace(array, predicate);
        return array;
    };

    expect(filterInPlace([], (() => true))).toStrictEqual([]);
    expect(filterInPlace([], (() => false))).toStrictEqual([]);
    expect(filterInPlace([1, 2, 3, 4], (() => true))).toStrictEqual([1, 2, 3, 4]);
    expect(filterInPlace([1, 2, 3, 4], (() => false))).toStrictEqual([]);
    expect(filterInPlace([1, 2, 3, 4], (x => (x % 2) === 0))).toStrictEqual([2, 4]);
});

test("Test speed settings and input units", () => {
    const getSpeedSettings = window.qBittorrent.Misc.getSpeedSettings;
    const getSpeedInputUnit = window.qBittorrent.Misc.getSpeedInputUnit;

    const binaryBytes = { speed_in_bits: false, speed_use_decimal_prefixes: false };
    const decimalBytes = { speed_in_bits: false, speed_use_decimal_prefixes: true };
    const binaryBits = { speed_in_bits: true, speed_use_decimal_prefixes: false };
    const decimalBits = { speed_in_bits: true, speed_use_decimal_prefixes: true };

    expect(getSpeedSettings()).toStrictEqual(binaryBytes);
    expect(getSpeedSettings({})).toStrictEqual(binaryBytes);
    expect(getSpeedSettings(null)).toStrictEqual(binaryBytes);
    expect(getSpeedSettings({ speed_in_bits: "true", speed_use_decimal_prefixes: 1 })).toStrictEqual(binaryBytes);
    expect(getSpeedSettings(decimalBits)).toStrictEqual(decimalBits);

    expect(getSpeedInputUnit(binaryBytes)).toBe("QBT_TR(KiB/s)QBT_TR[CONTEXT=misc]");
    expect(getSpeedInputUnit(decimalBytes)).toBe("QBT_TR(kB/s)QBT_TR[CONTEXT=misc]");
    expect(getSpeedInputUnit(binaryBits)).toBe("QBT_TR(Kibit/s)QBT_TR[CONTEXT=misc]");
    expect(getSpeedInputUnit(decimalBits)).toBe("QBT_TR(kbit/s)QBT_TR[CONTEXT=misc]");
});

test("Test speed input conversions", () => {
    const speedToInputValue = window.qBittorrent.Misc.speedToInputValue;
    const inputValueToSpeed = window.qBittorrent.Misc.inputValueToSpeed;

    const binaryBytes = { speed_in_bits: false, speed_use_decimal_prefixes: false };
    const decimalBytes = { speed_in_bits: false, speed_use_decimal_prefixes: true };
    const binaryBits = { speed_in_bits: true, speed_use_decimal_prefixes: false };
    const decimalBits = { speed_in_bits: true, speed_use_decimal_prefixes: true };

    expect(speedToInputValue(2048, binaryBytes)).toBe(2);
    expect(inputValueToSpeed(2, binaryBytes)).toBe(2048);
    expect(speedToInputValue(2000, decimalBytes)).toBe(2);
    expect(inputValueToSpeed(2, decimalBytes)).toBe(2000);
    expect(speedToInputValue(256, binaryBits)).toBe(2);
    expect(inputValueToSpeed(2, binaryBits)).toBe(256);
    expect(speedToInputValue(250, decimalBits)).toBe(2);
    expect(inputValueToSpeed(2, decimalBits)).toBe(250);

    expect(inputValueToSpeed(1.1, decimalBits)).toBe(138);
    expect(inputValueToSpeed("", binaryBytes)).toBe(0);
    expect(inputValueToSpeed(null, binaryBytes)).toBe(0);

    for (const invalidValue of [undefined, "invalid", Symbol("invalid"), -1, Number.NaN, Number.POSITIVE_INFINITY]) {
        expect(speedToInputValue(invalidValue, binaryBytes)).toBeNaN();
        expect(inputValueToSpeed(invalidValue, binaryBytes)).toBeNaN();
    }
});

test("Test KiB speed normalization", () => {
    const normalizeSpeedToKiB = window.qBittorrent.Misc.normalizeSpeedToKiB;
    const speedToInputValue = window.qBittorrent.Misc.speedToInputValue;
    const inputValueToSpeed = window.qBittorrent.Misc.inputValueToSpeed;
    const decimalBytes = { speed_in_bits: false, speed_use_decimal_prefixes: true };
    const decimalBits = { speed_in_bits: true, speed_use_decimal_prefixes: true };
    const maxValue = 2147482624;

    expect(normalizeSpeedToKiB(0)).toBe(0);
    expect(normalizeSpeedToKiB(1)).toBe(1024);
    expect(normalizeSpeedToKiB(1023)).toBe(1024);
    expect(normalizeSpeedToKiB(1024)).toBe(1024);
    expect(normalizeSpeedToKiB(1535)).toBe(1024);
    expect(normalizeSpeedToKiB(1536)).toBe(2048);
    expect(normalizeSpeedToKiB(2047)).toBe(2048);
    expect(normalizeSpeedToKiB(2048)).toBe(2048);
    expect(normalizeSpeedToKiB(2147483647)).toBe(maxValue);
    expect(normalizeSpeedToKiB(Number.MAX_SAFE_INTEGER)).toBe(maxValue);
    expect(normalizeSpeedToKiB(1125, 1024)).toBe(2048);
    expect(normalizeSpeedToKiB(923, 1024)).toBe(0);
    expect(normalizeSpeedToKiB(1501, 1500)).toBe(2048);
    expect(normalizeSpeedToKiB(1499, 1500)).toBe(1024);
    expect(normalizeSpeedToKiB(maxValue + 1, maxValue)).toBe(maxValue);
    expect(speedToInputValue(normalizeSpeedToKiB(inputValueToSpeed(1, decimalBytes)), decimalBytes)).toBe(1.024);
    expect(speedToInputValue(normalizeSpeedToKiB(inputValueToSpeed(1, decimalBits)), decimalBits)).toBe(8.192);

    for (const invalidValue of [undefined, "invalid", Symbol("invalid"), -1, Number.NaN, Number.POSITIVE_INFINITY])
        expect(normalizeSpeedToKiB(invalidValue)).toBeNaN();
});

test("Test friendlyUnit() speed settings", () => {
    const friendlyUnit = window.qBittorrent.Misc.friendlyUnit;
    const originalCache = window.qBittorrent.Cache;
    let settings = {};
    window.qBittorrent.Cache = {
        preferences: {
            get: () => settings
        }
    };

    settings = { speed_in_bits: false, speed_use_decimal_prefixes: false };
    expect(friendlyUnit(1, true)).toBe("1 QBT_TR(B)QBT_TR[CONTEXT=misc]QBT_TR(/s)QBT_TR[CONTEXT=misc]");
    expect(friendlyUnit(1024, true)).toBe("1.0 QBT_TR(KiB)QBT_TR[CONTEXT=misc]QBT_TR(/s)QBT_TR[CONTEXT=misc]");
    expect(friendlyUnit(1048576, true)).toBe("1.0 QBT_TR(MiB)QBT_TR[CONTEXT=misc]QBT_TR(/s)QBT_TR[CONTEXT=misc]");

    settings = { speed_in_bits: false, speed_use_decimal_prefixes: true };
    expect(friendlyUnit(1000, true)).toBe("1.0 QBT_TR(kB)QBT_TR[CONTEXT=misc]QBT_TR(/s)QBT_TR[CONTEXT=misc]");
    expect(friendlyUnit(1000000, true)).toBe("1.0 QBT_TR(MB)QBT_TR[CONTEXT=misc]QBT_TR(/s)QBT_TR[CONTEXT=misc]");

    settings = { speed_in_bits: true, speed_use_decimal_prefixes: false };
    expect(friendlyUnit(1, true)).toBe("8 QBT_TR(bit)QBT_TR[CONTEXT=misc]QBT_TR(/s)QBT_TR[CONTEXT=misc]");
    expect(friendlyUnit(128, true)).toBe("1.0 QBT_TR(Kibit)QBT_TR[CONTEXT=misc]QBT_TR(/s)QBT_TR[CONTEXT=misc]");
    expect(friendlyUnit(131072, true)).toBe("1.0 QBT_TR(Mibit)QBT_TR[CONTEXT=misc]QBT_TR(/s)QBT_TR[CONTEXT=misc]");

    settings = { speed_in_bits: true, speed_use_decimal_prefixes: true };
    expect(friendlyUnit(125, true)).toBe("1.0 QBT_TR(kbit)QBT_TR[CONTEXT=misc]QBT_TR(/s)QBT_TR[CONTEXT=misc]");
    expect(friendlyUnit(125000, true)).toBe("1.0 QBT_TR(Mbit)QBT_TR[CONTEXT=misc]QBT_TR(/s)QBT_TR[CONTEXT=misc]");

    // File sizes always retain IEC byte formatting.
    expect(friendlyUnit(1048576, false)).toBe("1.0 QBT_TR(MiB)QBT_TR[CONTEXT=misc]");
    expect(friendlyUnit(1000, false)).toBe("1000 QBT_TR(B)QBT_TR[CONTEXT=misc]");

    window.qBittorrent.Cache = originalCache;
});

test("Test friendlyUnit() defaults and invalid values", () => {
    const friendlyUnit = window.qBittorrent.Misc.friendlyUnit;
    const originalCache = window.qBittorrent.Cache;
    delete window.qBittorrent.Cache;

    expect(friendlyUnit(1048576, true)).toBe("1.0 QBT_TR(MiB)QBT_TR[CONTEXT=misc]QBT_TR(/s)QBT_TR[CONTEXT=misc]");
    for (const invalidValue of [undefined, null, "1024", -1, Number.NaN, Number.POSITIVE_INFINITY])
        expect(friendlyUnit(invalidValue, true)).toBe("QBT_TR(Unknown)QBT_TR[CONTEXT=misc]");

    window.qBittorrent.Cache = originalCache;
});

test("Test parseVersion()", () => {
    const parseVersion = window.qBittorrent.Misc.parseVersion;

    expect(parseVersion("")).toStrictEqual({ valid: false });
    expect(parseVersion("1")).toStrictEqual({ valid: true, major: 1, minor: undefined, fix: undefined, patch: undefined });
    expect(parseVersion("a")).toStrictEqual({ valid: true, major: "a", minor: undefined, fix: undefined, patch: undefined });
    expect(parseVersion("ab")).toStrictEqual({ valid: true, major: "ab", minor: undefined, fix: undefined, patch: undefined });
    expect(parseVersion("NaN")).toStrictEqual({ valid: true, major: "NaN", minor: undefined, fix: undefined, patch: undefined });
    expect(parseVersion("1.2")).toStrictEqual({ valid: true, major: 1, minor: 2, fix: undefined, patch: undefined });
    expect(parseVersion("1.ab")).toStrictEqual({ valid: true, major: 1, minor: "ab", fix: undefined, patch: undefined });
    expect(parseVersion("1.2.3")).toStrictEqual({ valid: true, major: 1, minor: 2, fix: 3, patch: undefined });
    expect(parseVersion("1.2.3.4")).toStrictEqual({ valid: true, major: 1, minor: 2, fix: 3, patch: 4 });
    expect(parseVersion("a.b.c.d")).toStrictEqual({ valid: true, major: "a", minor: "b", fix: "c", patch: "d" });
});

test("Test compareVersions()", () => {
    const cmp = (left, right, result) => {
        const compareVersions = window.qBittorrent.Misc.compareVersions;
        const parseVersion = window.qBittorrent.Misc.parseVersion;

        if (result < 0) {
            expect(compareVersions(left, right)).toBeLessThan(0);
            expect(compareVersions(parseVersion(left), right)).toBeLessThan(0);
            expect(compareVersions(left, parseVersion(right))).toBeLessThan(0);
        }
        else if (result === 0) {
            expect(compareVersions(left, right)).toBe(0);
            expect(compareVersions(parseVersion(left), right)).toBe(0);
            expect(compareVersions(left, parseVersion(right))).toBe(0);
        }
        else {
            expect(compareVersions(left, right)).toBeGreaterThan(0);
            expect(compareVersions(parseVersion(left), right)).toBeGreaterThan(0);
            expect(compareVersions(left, parseVersion(right))).toBeGreaterThan(0);
        }
    };

    cmp("", "", 0);

    cmp("1", "", -1);
    cmp("", "1", 1);
    cmp("1", "1", 0);

    cmp("a", "", -1);
    cmp("", "a", 1);
    cmp("a", "a", 0);

    cmp("NaN", "1", 1);
    cmp("1", "NaN", -1);
    cmp("NaN", "NaN", 0);

    cmp("1", "2", -1);
    cmp("2", "1", 1);

    cmp("1", "1.1", -1);
    cmp("1.1", "1", 1);
    cmp("1.1", "1.1", 0);

    cmp("1.1", "1.a", -1);
    cmp("1.a", "1.1", 1);
    cmp("1.a", "1.a", 0);

    cmp("1.a", "1.ab", -1);
    cmp("1.ab", "1.a", 1);
    cmp("1.ab", "1.ab", 0);

    cmp("1.2.3.4", "99.4.5", -1);
    cmp("99.4.5", "1.2.3.4", 1);

    cmp("1.2.3.4", "1.2.3.5", -1);
    cmp("1.2.3.4", "1.2.3.4", 0);
});

test("Test toFixedPointString()", () => {
    const toFixedPointString = window.qBittorrent.Misc.toFixedPointString;

    expect(toFixedPointString(0, 0)).toBe("0");
    expect(toFixedPointString(0, 1)).toBe("0.0");
    expect(toFixedPointString(0, 2)).toBe("0.00");

    expect(toFixedPointString(0.1, 0)).toBe("0");
    expect(toFixedPointString(0.1, 1)).toBe("0.1");
    expect(toFixedPointString(0.1, 2)).toBe("0.10");

    expect(toFixedPointString(-0.1, 0)).toBe("0");
    expect(toFixedPointString(-0.1, 1)).toBe("-0.1");
    expect(toFixedPointString(-0.1, 2)).toBe("-0.10");

    expect(toFixedPointString(1.005, 0)).toBe("1");
    expect(toFixedPointString(1.005, 1)).toBe("1.0");
    expect(toFixedPointString(1.005, 2)).toBe("1.00");
    expect(toFixedPointString(1.005, 3)).toBe("1.005");
    expect(toFixedPointString(1.005, 4)).toBe("1.0050");

    expect(toFixedPointString(-1.005, 0)).toBe("-1");
    expect(toFixedPointString(-1.005, 1)).toBe("-1.0");
    expect(toFixedPointString(-1.005, 2)).toBe("-1.00");
    expect(toFixedPointString(-1.005, 3)).toBe("-1.005");
    expect(toFixedPointString(-1.005, 4)).toBe("-1.0050");

    expect(toFixedPointString(35.855, 0)).toBe("35");
    expect(toFixedPointString(35.855, 1)).toBe("35.8");
    expect(toFixedPointString(35.855, 2)).toBe("35.85");
    expect(toFixedPointString(35.855, 3)).toBe("35.855");
    expect(toFixedPointString(35.855, 4)).toBe("35.8550");

    expect(toFixedPointString(-35.855, 0)).toBe("-35");
    expect(toFixedPointString(-35.855, 1)).toBe("-35.8");
    expect(toFixedPointString(-35.855, 2)).toBe("-35.85");
    expect(toFixedPointString(-35.855, 3)).toBe("-35.855");
    expect(toFixedPointString(-35.855, 4)).toBe("-35.8550");

    expect(toFixedPointString(100, 0)).toBe("100");
    expect(toFixedPointString(100, 1)).toBe("100.0");
    expect(toFixedPointString(100, 2)).toBe("100.00");

    expect(toFixedPointString(-100, 0)).toBe("-100");
    expect(toFixedPointString(-100, 1)).toBe("-100.0");
    expect(toFixedPointString(-100, 2)).toBe("-100.00");
});

test("Test formatDate() - Format Coverage", () => {
    const formatDate = window.qBittorrent.Misc.formatDate;
    const testDate = new Date(2025, 7, 23, 22, 32, 46); // Aug 23, 2025 10:32:46 PM

    expect(formatDate(testDate, "MM/dd/yyyy, h:mm:ss AM/PM")).toBe("08/23/2025, 10:32:46 PM");
    expect(formatDate(testDate, "MM/dd/yyyy, HH:mm:ss")).toBe("08/23/2025, 22:32:46");
    expect(formatDate(testDate, "dd/MM/yyyy, HH:mm:ss")).toBe("23/08/2025, 22:32:46");
    expect(formatDate(testDate, "yyyy-MM-dd HH:mm:ss")).toBe("2025-08-23 22:32:46");
    expect(formatDate(testDate, "yyyy/MM/dd HH:mm:ss")).toBe("2025/08/23 22:32:46");
    expect(formatDate(testDate, "dd.MM.yyyy, HH:mm:ss")).toBe("23.08.2025, 22:32:46");
    expect(formatDate(testDate, "MMM dd, yyyy, h:mm:ss AM/PM")).toBe("Aug 23, 2025, 10:32:46 PM");
    expect(formatDate(testDate, "dd MMM yyyy, HH:mm:ss")).toBe("23 Aug 2025, 22:32:46");
});

test("Test formatDate() - Fallback Behavior", () => {
    // Mock ClientData.get
    const mockGet = vi.fn().mockReturnValue("default");
    const originalParent = window.parent;

    window.parent = {
        qBittorrent: {
            ClientData: {
                get: mockGet
            }
        }
    };

    const formatDate = window.qBittorrent.Misc.formatDate;
    const testDate = new Date(2025, 7, 23, 22, 32, 46); // Aug 23, 2025 10:32:46 PM
    const expectedDefault = testDate.toLocaleString();

    // Test that "default" format uses toLocaleString()
    expect(formatDate(testDate, "default")).toBe(expectedDefault);

    // Test default behavior when no format argument is provided
    expect(mockGet).toHaveBeenCalledTimes(0);
    expect(formatDate(testDate)).toBe(expectedDefault);
    expect(mockGet).toHaveBeenCalledWith("date_format");
    expect(mockGet).toHaveBeenCalledTimes(1);

    // Test with unknown/invalid format strings
    expect(formatDate(testDate, "invalid-format")).toBe(expectedDefault);
    expect(formatDate(testDate, "")).toBe(expectedDefault);
    expect(formatDate(testDate, null)).toBe(expectedDefault);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(formatDate(testDate, undefined)).toBe(expectedDefault);
    expect(mockGet).toHaveBeenCalledWith("date_format");
    expect(mockGet).toHaveBeenCalledTimes(2);

    // Restore original window.parent
    window.parent = originalParent;
});
