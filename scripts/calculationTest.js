function CalcVideoAndTsBitrate(
  sr,
  audioBitRate,
  fec,
  pilots,
  frame,
  modulation,
  expected
) {

  let videoBitRate = 0;

  let numerator = parseInt(fec.substr(0, 1));
  let denominator = parseInt(fec.substr(2, 2));
  let fecCalculated = numerator / denominator;

  let constelModeMultiplier =
    modulation === "qpsk"
      ? 2
      : modulation === "8psk"
      ? 3
      : modulation === "16apsk"
      ? 4
      : 5;
  let TSBitRate =
    (((constelModeMultiplier * sr * 188) / 204) * fecCalculated * 1075) / 1000;
  switch (modulation) {
    case "qpsk":
      if (fec === "1/4")
        TSBitRate = (1000 * TSBitRate * 9895) / 100 / 100 / 1000;
      if (fec === "1/3")
        TSBitRate = (1000 * TSBitRate * 9935) / 100 / 100 / 1000;
      if (fec === "2/5")
        TSBitRate = (1000 * TSBitRate * 9970) / 100 / 100 / 1000;
      if (fec === "1/2")
        TSBitRate = (1000 * TSBitRate * 9978) / 100 / 100 / 1000;
      if (fec === "3/5")
        TSBitRate = (1000 * TSBitRate * 9994) / 100 / 100 / 1000;
      if (fec === "2/3")
        TSBitRate = (1000 * TSBitRate * 10010) / 100 / 100 / 1000;
      if (fec === "3/4")
        TSBitRate = (1000 * TSBitRate * 10009) / 100 / 100 / 1000;
      if (fec === "4/5")
        TSBitRate = (1000 * TSBitRate * 10014) / 100 / 100 / 1000;
      if (fec === "5/6")
        TSBitRate = (1000 * TSBitRate * 10021) / 100 / 100 / 1000;
      if (fec === "8/9")
        TSBitRate = (1000 * TSBitRate * 10028) / 100 / 100 / 1000;
      if (fec === "9/10")
        TSBitRate = (1000 * TSBitRate * 10030) / 100 / 100 / 1000;
      break;
    case "8psk":
      if (fec === "3/5")
        TSBitRate = (1000 * TSBitRate * 9980) / 100 / 100 / 1000;
      if (fec === "2/3")
        TSBitRate = (1000 * TSBitRate * 9988) / 100 / 100 / 1000;
      if (fec === "3/4")
        TSBitRate = (1000 * TSBitRate * 9995) / 100 / 100 / 1000;
      if (fec === "5/6")
        TSBitRate = (1000 * TSBitRate * 10005) / 100 / 100 / 1000;
      if (fec === "8/9")
        TSBitRate = (1000 * TSBitRate * 10015) / 100 / 100 / 1000;
      if (fec === "9/10")
        TSBitRate = (1000 * TSBitRate * 10016) / 100 / 100 / 1000;
      break;
    case "16apsk":
      if (fec === "2/3")
        TSBitRate = (1000 * TSBitRate * 9980) / 100 / 100 / 1000;
      if (fec === "3/4")
        TSBitRate = (1000 * TSBitRate * 9981) / 100 / 100 / 1000;
      if (fec === "5/6")
        TSBitRate = (1000 * TSBitRate * 9992) / 100 / 100 / 1000;
      if (fec === "8/9")
        TSBitRate = (1000 * TSBitRate * 10001) / 100 / 100 / 1000;
      if (fec === "9/10")
        TSBitRate = (1000 * TSBitRate * 10002) / 100 / 100 / 1000;
      break;
    case "32apsk":
      if (fec === "3/4")
        TSBitRate = (1000 * TSBitRate * 9967) / 100 / 100 / 1000;
      if (fec === "5/6")
        TSBitRate = (1000 * TSBitRate * 9977) / 100 / 100 / 1000;
      if (fec === "8/9")
        TSBitRate = (1000 * TSBitRate * 9987) / 100 / 100 / 1000;
      if (fec === "9/10")
        TSBitRate = (1000 * TSBitRate * 9988) / 100 / 100 / 1000;
      break;
  }
  if (pilots === "1")
    TSBitRate = (1000 * TSBitRate * 9766) / 100 / 100 / 1000; /** added */
  if (frame === "short")
    TSBitRate = (1000 * TSBitRate * 9484) / 100 / 100 / 1000; /** added */

  if (sr > 20 && sr < 36)
    videoBitRate = (1000 * TSBitRate * 50) / 100 / 1000 - audioBitRate;
  if (sr > 35 && sr < 67)
    videoBitRate = (1000 * TSBitRate * 56) / 100 / 1000 - audioBitRate;
  if (sr > 66 && sr < 126)
    videoBitRate = (1000 * TSBitRate * 66) / 100 / 1000 - audioBitRate;
  if (sr > 125 && sr < 251)
    videoBitRate = (1000 * TSBitRate * 75) / 100 / 1000 - audioBitRate;
  if (sr > 250 && sr < 334)
    videoBitRate = (1000 * TSBitRate * 81) / 100 / 1000 - audioBitRate;
  if (sr > 333 && sr < 501)
    videoBitRate = (1000 * TSBitRate * 84) / 100 / 1000 - audioBitRate;
  if (sr > 500 && sr < 1001)
    videoBitRate = (1000 * TSBitRate * 86) / 100 / 1000 - audioBitRate;
  if (sr > 1000 && sr < 1501)
    videoBitRate = (1000 * TSBitRate * 87) / 100 / 1000 - audioBitRate;
  if (sr > 1500 && sr < 3001)
    videoBitRate = (1000 * TSBitRate * 88) / 100 / 1000 - audioBitRate;
  switch (modulation) {
    case "qpsk":
      if (fec === "1/4") videoBitRate = (videoBitRate * 80) / 100;
      if (fec === "1/3") videoBitRate = (videoBitRate * 87) / 100;
      if (fec === "2/5") videoBitRate = (videoBitRate * 91) / 100;
      if (fec === "1/2") videoBitRate = (videoBitRate * 94) / 100;
      if (fec === "3/5") videoBitRate = (videoBitRate * 96) / 100;
      if (fec === "2/3") videoBitRate = (videoBitRate * 98) / 100;
      if (fec === "3/4") videoBitRate = (videoBitRate * 100) / 100;
      if (fec === "4/5") videoBitRate = (videoBitRate * 100) / 100;
      if (fec === "5/6") videoBitRate = (videoBitRate * 100) / 100;
      if (fec === "8/9") videoBitRate = (videoBitRate * 100) / 100;
      if (fec === "9/10") videoBitRate = (videoBitRate * 100) / 100;
      break;
    case "8psk":
      if (fec === "3/5") videoBitRate = (videoBitRate * 101) / 100;
      if (fec === "2/3") videoBitRate = (videoBitRate * 101) / 100;
      if (fec === "3/4") videoBitRate = (videoBitRate * 101) / 100;
      if (fec === "5/6") videoBitRate = (videoBitRate * 102) / 100;
      if (fec === "8/9") videoBitRate = (videoBitRate * 102) / 100;
      if (fec === "9/10") videoBitRate = (videoBitRate * 102) / 100;
      break;
    case "16apsk":
      if (fec === "2/3") videoBitRate = (videoBitRate * 103) / 100;
      if (fec === "3/4") videoBitRate = (videoBitRate * 103) / 100;
      if (fec === "5/6") videoBitRate = (videoBitRate * 103) / 100;
      if (fec === "8/9") videoBitRate = (videoBitRate * 103) / 100;
      if (fec === "9/10") videoBitRate = (videoBitRate * 103) / 100;
      break;
    case "32apsk":
      if (fec === "3/4") videoBitRate = (videoBitRate * 104) / 100;
      if (fec === "5/6") videoBitRate = (videoBitRate * 104) / 100;
      if (fec === "8/9") videoBitRate = (videoBitRate * 104) / 100;
      if (fec === "9/10") videoBitRate = (videoBitRate * 104) / 100;
      break;
  }

  return `${modulation}:  SR: ${sr}, ABR: ${audioBitRate}, FEC: ${fec}, TSBitrate: ${TSBitRate.toFixed(
    2
  )}, VBITRATE: ${videoBitRate.toFixed(2)}, Expected: ${(expected/1024).toFixed(2)}kB/s`;
}

const fecTSLookup = {
  qpsk: {
    "1/4": {
      35: 17159,
      66: 32356,
      125: 61280,
      250: 122561,
      333: 163251,
      500: 245122,
      1000: 490243,
      1500: 735365,
      2000: 980486,
      3000: 1470729,
    },
    "1/3": {
      35: 22976,
      66: 43326,
      125: 82056,
      250: 164112,
      333: 218597,
      500: 328224,
      1000: 656448,
      1500: 984672,
      2000: 1312896,
      3000: 1969344,
    },
    "2/5": {
      35: 27629,
      66: 52101,
      125: 98677,
      250: 197353,
      333: 262874,
      500: 394706,
      1000: 789412,
      1500: 1184118,
      2000: 1578824,
      3000: 2368236,
    },
    "1/2": {
      35: 34610,
      66: 65265,
      125: 123607,
      250: 247215,
      333: 329290,
      500: 494429,
      1000: 988858,
      1500: 1483287,
      2000: 1977716,
      3000: 2966574,
    },
    "3/5": {
      35: 41591,
      66: 78428,
      125: 148538,
      250: 297076,
      333: 395705,
      500: 594152,
      1000: 1188304,
      1500: 1782456,
      2000: 2376608,
      3000: 3564912,
    },
    "2/3": {
      35: 46279,
      66: 87269,
      125: 165282,
      250: 330563,
      333: 440310,
      500: 661127,
      1000: 1322253,
      1500: 1983380,
      2000: 2644506,
      3000: 3966759,
    },
    "3/4": {
      35: 52062,
      66: 98173,
      125: 185934,
      250: 371868,
      333: 495329,
      500: 743737,
      1000: 1487473,
      1500: 2231210,
      2000: 2974946,
      3000: 4462419,
    },
    "4/5": {
      35: 55552,
      66: 104755,
      125: 198400,
      250: 396799,
      333: 528536,
      500: 793598,
      1000: 1587196,
      1500: 2380794,
      2000: 3174392,
      3000: 4761588,
    },
    "5/6": {
      35: 57913,
      66: 109208,
      125: 206833,
      250: 413666,
      333: 551003,
      500: 827332,
      1000: 1654663,
      1500: 2481995,
      2000: 3309326,
      3000: 4963989,
    },
    "8/9": {
      35: 61826,
      66: 116586,
      125: 220806,
      250: 441613,
      333: 588228,
      500: 883226,
      1000: 1766451,
      1500: 2649677,
      2000: 3532902,
      3000: 5299353,
    },
    "9/10": {
      35: 62601,
      66: 118048,
      125: 223577,
      250: 447153,
      333: 595608,
      500: 894306,
      1000: 1788612,
      1500: 2682918,
      2000: 3577224,
      3000: 5365836,
    },
  },
  "8psk": {
    "3/5": {
      35: 62300,
      66: 117479,
      125: 222499,
      250: 444998,
      333: 592737,
      500: 889996,
      1000: 1779991,
      1500: 2669987,
      2000: 3559982,
      3000: 5339973,
    },
    "2/3": {
      35: 69322,
      66: 130722,
      125: 247580,
      250: 495159,
      333: 659552,
      500: 990318,
      1000: 1980636,
      1500: 2970954,
      2000: 3961272,
      3000: 5941908,
    },
    "3/4": {
      35: 77984,
      66: 147056,
      125: 278516,
      250: 557031,
      333: 741965,
      500: 1114062,
      1000: 2228124,
      1500: 3342186,
      2000: 4456248,
      3000: 6684372,
    },
    "5/6": {
      35: 86750,
      66: 163585,
      125: 309820,
      250: 619641,
      333: 1239281,
      500: 1239281,
      1000: 2478562,
      1500: 3717843,
      2000: 4957124,
      3000: 7435687,
    },
    "8/9": {
      35: 92610,
      66: 174637,
      125: 330752,
      250: 661503,
      333: 881122,
      500: 1323006,
      1000: 2646012,
      1500: 3969018,
      2000: 5292024,
      3000: 7938036,
    },
    "9/10": {
      35: 93772,
      66: 176828,
      125: 334901,
      250: 669802,
      333: 892176,
      500: 1339604,
      1000: 2679207,
      1500: 4018811,
      2000: 5358414,
      3000: 8037622,
    },
  },
  "16apsk": {
    "2/3": {
      35: 92302,
      66: 174055,
      125: 329650,
      250: 659300,
      333: 878188,
      500: 1318601,
      1000: 2637201,
      1500: 3955802,
      2000: 5274402,
      3000: 7911603,
    },
    "3/4": {
      35: 115506,
      66: 195804,
      125: 370841,
      250: 741682,
      333: 987920,
      500: 1483364,
      1000: 2966728,
      1500: 4450092,
      2000: 5933456,
      3000: 8900184,
    },
    "5/6": {
      35: 115506,
      66: 217812,
      125: 412523,
      250: 825046,
      333: 1098961,
      500: 1650092,
      1000: 3300184,
      1500: 4950276,
      2000: 6600368,
      3000: 9900552,
    },
    "8/9": {
      35: 123310,
      66: 232527,
      125: 440393,
      250: 880786,
      333: 1173207,
      500: 1761572,
      1000: 3523143,
      1500: 5284715,
      2000: 7046286,
      3000: 10569429,
    },
    "9/10": {
      35: 124857,
      66: 235445,
      125: 445918,
      250: 891836,
      333: 1187925,
      500: 1783671,
      1000: 3567342,
      1500: 5351013,
      2000: 7134684,
      3000: 10702026,
    },
  },
  "32apsk": {
    "3/4": {
      35: 129615,
      66: 244417,
      125: 462912,
      250: 925824,
      333: 1233197,
      500: 1851648,
      1000: 3703295,
      1500: 5554943,
      2000: 7406590,
      3000: 11109885,
    },
    "5/6": {
      35: 144184,
      66: 271890,
      125: 514943,
      250: 1029885,
      333: 1371807,
      500: 2059770,
      1000: 4119540,
      1500: 6179311,
      2000: 8239081,
      3000: 12358621,
    },
    "8/9": {
      35: 153925,
      66: 290258,
      125: 549732,
      250: 1099464,
      333: 1464485,
      500: 2198927,
      1000: 4397854,
      1500: 6596781,
      2000: 8795708,
      3000: 13193562,
    },
    "9/10": {
      35: 155856,
      66: 293900,
      125: 556628,
      250: 1113257,
      333: 1482858,
      500: 2226514,
      1000: 4453027,
      1500: 6679540,
      2000: 8906054,
      3000: 13359080,
    },
  },
};

var keyNames = Object.keys(fecTSLookup);
console.log(keyNames);
for (let mod in fecTSLookup) {
  for (let fec in fecTSLookup[mod]) {
    for (let sr in fecTSLookup[mod][fec]) {
      console.dir(CalcVideoAndTsBitrate(sr, 48, fec, "off", "long", mod, fecTSLookup[mod][fec][sr]));
    }
  }
}

