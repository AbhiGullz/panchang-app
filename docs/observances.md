# Regional observances

Home shows observances for the selected date below Month, plus a separate
tomorrow reminder. No empty placeholder is shown. December 31 reminders query
the following year. Display language never selects or hides a regional tradition.
Festivals provides an All traditions view and regional filters; pan-India
observances remain included in each regional view.

The first expanded catalog adds Kojagiri, Devshayani, Yogini, Prabodhini,
Gajanan Maharaj Prakat Din and Punyatithi, lunar Shiv Jayanti, Rama Navami,
Akshaya Tritiya, Rishi Panchami, Ratha Saptami, Chitra Pournami, Thaipusam,
and Panguni Uthiram. Each has explicit names for all ten app languages.
This is an initial regional catalog, not complete coverage of every tradition.

New rules use selected latitude, longitude and timezone. Lunar rules use
canonical Amanta months regardless of the selected month-label school. Yogini
is Jyeshtha Krishna in Amanta (= Ashadha Krishna in Purnimanta). Adhika months
do not inherit regular-month observances. Tamil rules use solar signs and
nakshatras rather than translating lunar month labels.

Sunrise tithi is the default reference; Kojagiri samples midnight ending the
civil day and Rama Navami samples local noon. A tithi skipped at sunrise is
included as a daytime-tithi reminder when present at noon. These reminders
do not determine sampradaya-specific fasting/parana rules. Repeated sunrise
tithis currently use the first matching date. Polar sunrise-based rules are
omitted when no sunrise is available.

The five Diwali-sequence festivals now use exact tithi intervals and local
sunrise/sunset windows. Dhanteras and Diwali select the greatest overlap with
pradosha (first fifth of the local night); Narak Chaturdashi uses the 96 minutes
before sunrise; Govardhan uses the first fifth of daylight; Bhai Dooj uses the
fourth fifth of daylight. Exact ties choose the later civil date. Multiple
qualifying windows are marked as a regional variation. Where none overlap,
the civil day containing most of the tithi is selected with an explicit
best-fit note. The API exposes tithi bounds, selected overlap bounds, source,
selection basis and alternate civil dates. These windows are observance
selection references, not calculated Sthira Lagna or full ritual muhurta.

2026 Delhi sequence: Nov 6, 8, 8, 10, 11. New Jersey: Nov 6, 7, 8, 9, 10.
Govardhan's Nov 10 selection follows the morning-Pratipada rule; the IMD civil
festival table lists Nov 9. The app labels regional variation rather than
claiming universal agreement. The legacy undated Diwali entry is replaced.

Remaining legacy festival rules still use their existing India-based simplified rules.
They require separate replacement and reference validation before the entire
annual calendar can claim location-aware, tradition-specific accuracy.
Further work includes all named Ekadashis, Padmini/Parama in adhika months,
Pradosh, moonrise-based Sankashti, Varalakshmi regional variants, and additional
Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati and Punjabi observances.

References:
- https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=4
- https://gajananmaharaj.org/sgmsenglish/punyatithi.htm
- https://shreegajanangunjan.org/index.php/sample-page/mauli0/maulipd/
- https://palani.org/festivals/
- https://packolkata.imd.gov.in/panchang/index.php/en/festivals
- https://www.gajanannj.org/event-details-registration/gajanan-maharaj-prakat-din-2026
- https://www.drikpanchang.com/ekadashis/yogini/yogini-ekadashi-date-time.html?lang=en&year=2026
