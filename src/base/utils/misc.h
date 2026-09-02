/*
 * Bittorrent Client using Qt and libtorrent.
 * Copyright (C) 2006  Christophe Dumez <chris@qbittorrent.org>
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

#pragma once

#include <optional>

#include <QtTypes>

#include "base/pathfwd.h"

class QString;
class QStringView;

/*  Miscellaneous functions that can be useful */
namespace Utils::Misc
{
    enum class UnitType
    {
        Bit,
        Byte
    };

    enum class UnitPrefix : qint64
    {
        None = 1,
        Kilo = 1000LL,
        Kibi = 1024LL,
        Mega = 1000LL * 1000,
        Mebi = 1024LL * 1024,
        Giga = 1000LL * 1000 * 1000,
        Gibi = 1024LL * 1024 * 1024,
        Tera = 1000LL * 1000 * 1000 * 1000,
        Tebi = 1024LL * 1024 * 1024 * 1024,
        Peta = 1000LL * 1000 * 1000 * 1000 * 1000,
        Pebi = 1024LL * 1024 * 1024 * 1024 * 1024,
        Exa = 1000LL * 1000 * 1000 * 1000 * 1000 * 1000,
        Exbi = 1024LL * 1024 * 1024 * 1024 * 1024 * 1024
    };

    struct Unit
    {
        UnitType type;
        UnitPrefix prefix;

        friend bool operator==(const Unit &, const Unit &) = default;
    };

    // use binary prefix standards from IEC 60027-2
    // see http://en.wikipedia.org/wiki/Kilobyte
    enum class SizeUnit
    {
        Byte,       // 1024^0,
        KibiByte,   // 1024^1,
        MebiByte,   // 1024^2,
        GibiByte,   // 1024^3,
        TebiByte,   // 1024^4,
        PebiByte,   // 1024^5,
        ExbiByte    // 1024^6,
        // int64 is used for sizes and thus the next units can not be handled
        // ZebiByte,   // 1024^7,
        // YobiByte,   // 1024^8
    };

    enum class TimeResolution
    {
        Seconds,
        Minutes
    };

    QString parseHtmlLinks(const QString &rawText);

    QString osName();
    QString boostVersionString();
    QString libtorrentVersionString();
    QString opensslVersionString();
    QString zlibVersionString();

    QString unitString(SizeUnit unit, bool isSpeed = false);
    QString unitString(Unit unit, bool isSpeed = false);

    // return the best user friendly storage unit (B, KiB, MiB, GiB, TiB)
    // value must be given in bytes
    QString friendlyUnit(qint64 bytes, bool isSpeed = false, int precision = -1);
    QString friendlySpeedUnit(qint64 bytes, UnitType type, bool useDecimalPrefixes, int precision = -1);
    QString friendlySpeedUnitCompact(qint64 bytes, UnitType type, bool useDecimalPrefixes);
    QString friendlyUnitCompact(qint64 bytes);
    int friendlyUnitPrecision(SizeUnit unit);
    int friendlyUnitPrecision(UnitPrefix prefix);
    qint64 sizeInBytes(qreal size, SizeUnit unit);
    UnitPrefix unitPrefixForExponent(int exponent, bool useDecimalPrefixes);
    Unit speedInputUnit(UnitType type, bool useDecimalPrefixes);
    qreal bytesToUnitValue(qint64 bytes, Unit unit);
    std::optional<qint64> unitValueToBytes(qreal value, Unit unit);
    qint64 normalizeKibiByteRate(qint64 bytes);
    qint64 normalizeKibiByteRate(qint64 bytes, qint64 currentBytes);

    bool isPreviewable(const Path &filePath);
    bool isTorrentLink(const QString &str);

    // Take a number of seconds and return a user-friendly
    // time duration like "1d 2h 10m".
    QString userFriendlyDuration(qlonglong seconds, qlonglong maxCap = -1, TimeResolution resolution = TimeResolution::Minutes);

    QString languageToLocalizedString(QStringView localeStr);
}
