/*
 * Bittorrent Client using Qt and libtorrent.
 * Copyright (C) 2026  Mark Yu (vafada)
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

#include <QObject>
#include <QLocale>
#include <QTest>

#include <limits>

#include "base/utils/misc.h"

class TestUtilsMisc final : public QObject
{
    Q_OBJECT
    Q_DISABLE_COPY_MOVE(TestUtilsMisc)

public:
    TestUtilsMisc() = default;

private slots:
    void testFriendlySpeedUnit() const
    {
        using Utils::Misc::UnitType;
        using Utils::Misc::friendlySpeedUnit;

        QCOMPARE(friendlySpeedUnit(0, UnitType::Byte, false), (u"0" + QChar::Nbsp + u"B/s"));
        QCOMPARE(friendlySpeedUnit(0, UnitType::Bit, true), (u"0" + QChar::Nbsp + u"bit/s"));
        QCOMPARE(friendlySpeedUnit(1048576, UnitType::Byte, false), (u"1.0" + QChar::Nbsp + u"MiB/s"));
        QCOMPARE(friendlySpeedUnit(1000000, UnitType::Byte, true), (u"1.0" + QChar::Nbsp + u"MB/s"));
        QCOMPARE(friendlySpeedUnit(131072, UnitType::Bit, false), (u"1.0" + QChar::Nbsp + u"Mibit/s"));
        QCOMPARE(friendlySpeedUnit(125000, UnitType::Bit, true), (u"1.0" + QChar::Nbsp + u"Mbit/s"));
        QCOMPARE(friendlySpeedUnit(1000, UnitType::Byte, false)
                , (QLocale::system().toString(1000) + QChar::Nbsp + u"B/s"));
        QCOMPARE(friendlySpeedUnit(1000, UnitType::Byte, true), (u"1.0" + QChar::Nbsp + u"kB/s"));
        QCOMPARE(friendlySpeedUnit(127, UnitType::Bit, false)
                , (QLocale::system().toString(1016) + QChar::Nbsp + u"bit/s"));
        QCOMPARE(friendlySpeedUnit(128, UnitType::Bit, false), (u"1.0" + QChar::Nbsp + u"Kibit/s"));
        QCOMPARE(friendlySpeedUnit(-1, UnitType::Bit, true), QStringLiteral("Unknown"));
        QCOMPARE(Utils::Misc::friendlySpeedUnitCompact(125000, UnitType::Bit, true)
                , (u"1.00" + QChar::Nbsp + u"Mb"));

        QCOMPARE(Utils::Misc::friendlyUnit(1024, true, 0), (u"1" + QChar::Nbsp + u"KiB/s"));
        QCOMPARE(Utils::Misc::friendlyUnit(1000)
                , (QLocale::system().toString(1000) + QChar::Nbsp + u"B"));
    }

    void testSpeedInputUnits() const
    {
        using Utils::Misc::Unit;
        using Utils::Misc::UnitPrefix;
        using Utils::Misc::UnitType;

        const Unit iecBytes = Utils::Misc::speedInputUnit(UnitType::Byte, false);
        const Unit siBytes = Utils::Misc::speedInputUnit(UnitType::Byte, true);
        const Unit iecBits = Utils::Misc::speedInputUnit(UnitType::Bit, false);
        const Unit siBits = Utils::Misc::speedInputUnit(UnitType::Bit, true);

        QVERIFY(iecBytes == (Unit {UnitType::Byte, UnitPrefix::Kibi}));
        QVERIFY(siBytes == (Unit {UnitType::Byte, UnitPrefix::Kilo}));
        QVERIFY(iecBits == (Unit {UnitType::Bit, UnitPrefix::Kibi}));
        QVERIFY(siBits == (Unit {UnitType::Bit, UnitPrefix::Kilo}));

        QCOMPARE(Utils::Misc::unitString(iecBytes, true), QStringLiteral("KiB/s"));
        QCOMPARE(Utils::Misc::unitString(siBytes, true), QStringLiteral("kB/s"));
        QCOMPARE(Utils::Misc::unitString(iecBits, true), QStringLiteral("Kibit/s"));
        QCOMPARE(Utils::Misc::unitString(siBits, true), QStringLiteral("kbit/s"));

        QCOMPARE(Utils::Misc::bytesToUnitValue(1024, iecBytes), 1.0);
        QCOMPARE(Utils::Misc::bytesToUnitValue(1000, siBytes), 1.0);
        QCOMPARE(Utils::Misc::bytesToUnitValue(128, iecBits), 1.0);
        QCOMPARE(Utils::Misc::bytesToUnitValue(125, siBits), 1.0);

        QCOMPARE(Utils::Misc::unitValueToBytes(1, iecBytes).value(), 1024);
        QCOMPARE(Utils::Misc::unitValueToBytes(1, siBytes).value(), 1000);
        QCOMPARE(Utils::Misc::unitValueToBytes(1, iecBits).value(), 128);
        QCOMPARE(Utils::Misc::unitValueToBytes(1, siBits).value(), 125);
        QVERIFY(!Utils::Misc::unitValueToBytes(-1, siBits));
        QVERIFY(!Utils::Misc::unitValueToBytes(std::numeric_limits<qreal>::infinity(), siBits));

        QCOMPARE(Utils::Misc::normalizeKibiByteRate(0), 0);
        QCOMPARE(Utils::Misc::normalizeKibiByteRate(1), 1024);
        QCOMPARE(Utils::Misc::normalizeKibiByteRate(1024), 1024);
        QCOMPARE(Utils::Misc::normalizeKibiByteRate(1535), 1024);
        QCOMPARE(Utils::Misc::normalizeKibiByteRate(1536), 2048);
        QCOMPARE(Utils::Misc::normalizeKibiByteRate(2000), 2048);
        QCOMPARE(Utils::Misc::normalizeKibiByteRate(2048), 2048);
        QCOMPARE(Utils::Misc::normalizeKibiByteRate(std::numeric_limits<int>::max()), 2147482624);
        QCOMPARE(Utils::Misc::normalizeKibiByteRate(1152, 1024), 2048);
        QCOMPARE(Utils::Misc::normalizeKibiByteRate(2000, 1024), 2048);
        QCOMPARE(Utils::Misc::normalizeKibiByteRate(1920, 2048), 1024);
        QCOMPARE(Utils::Misc::normalizeKibiByteRate(896, 1024), 0);
        QCOMPARE(Utils::Misc::normalizeKibiByteRate(923, 1024), 0);
    }

    void testfriendlyUnitCompact() const
    {
        QCOMPARE(Utils::Misc::friendlyUnitCompact(500), (u"500" + QChar::Nbsp + u"B"));
        QCOMPARE(Utils::Misc::friendlyUnitCompact(1000), (u"0.97" + QChar::Nbsp + u"K"));
        QCOMPARE(Utils::Misc::friendlyUnitCompact(5000), (u"4.88" + QChar::Nbsp + u"K"));
        QCOMPARE(Utils::Misc::friendlyUnitCompact(10000), (u"9.76" + QChar::Nbsp + u"K"));
        QCOMPARE(Utils::Misc::friendlyUnitCompact(15000), (u"14.6" + QChar::Nbsp + u"K"));
        QCOMPARE(Utils::Misc::friendlyUnitCompact(100000), (u"97.6" + QChar::Nbsp + u"K"));
        QCOMPARE(Utils::Misc::friendlyUnitCompact(150000), (u"146" + QChar::Nbsp + u"K"));
        QCOMPARE(Utils::Misc::friendlyUnitCompact(1000000), (u"976" + QChar::Nbsp + u"K"));
        QCOMPARE(Utils::Misc::friendlyUnitCompact(10000000), (u"9.53" + QChar::Nbsp + u"M"));
        QCOMPARE(Utils::Misc::friendlyUnitCompact(15000000), (u"14.3" + QChar::Nbsp + u"M"));
        QCOMPARE(Utils::Misc::friendlyUnitCompact(10000000000), (u"9.31" + QChar::Nbsp + u"G"));
    }
};

QTEST_APPLESS_MAIN(TestUtilsMisc)
#include "testutilsmisc.moc"
