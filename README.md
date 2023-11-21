# DATV-Simple

## Prerequisite 
- **VERY IMPORTANT**
  - Heatsinks on the plutoSDR's microchips 
- Latest beta PlutoSDR [firmware](https://github.com/F5OEO/pluto-ori-ps/wiki)
- Firmware flashing [walk through video](https://www.youtube.com/watch?v=g8_ktz4kCkY)

## Motivation
DATV transmissions normally have the following programs open:
 1. OBS
 2. ~DATV-Easy/FreeStreamCoder/your own scripts (encoder)~
 3. ~Operating PlutoSDR via `HTTP`~  
 4. ~OpenTuner / Minitioune~
 5. ~QuickTune / Chat~

## **Capabilities of project**
  - Encoding of TS data (Tx) 
  - Tuning of onboard longmynd server, `requires USB hub` refer to [wiki](https://github.com/F5OEO/pluto-ori-ps/wiki#hardware) (Rx)
    - No further software dependencies, work in progress
  - Operation of PlutoSDR RF modulator parameters (Tx)
  - Sends UDP payload to `Minitioune` software control address (Rx)
    - Tunes Minitiouner radio using `Minitioune` software
    - OpenTuner support pending
    - for other tuner configs
      - Learn `node-red` and build it yourself `:)` 
  - Optional chat (QoL)
  - Optional SONOFF tasmota support (QoL)
    - WiFi operation, since `Tx` and toggling power of PA are not things that happen together.
    - My SONOFF basic is right next to amp, no issues with interference on `2.435GHz`

## Setup and use
1. Download [latest release](https://github.com/Psynosaur/DATV-Simple/releases) and extract to folder `DATV-Simple` and open in file explorer (you'll need [7zip](https://www.7-zip.org/download.html))

2. **VERY IMPORTANT** Please make sure to place the folder in a path without spaces like: `C:\radio\DATV-Simple`

3. Setup mqtt broker in `pluto.json` file
   
   ```json
    {
      "action": "connect",
      "broker": {
        "broker": "192.168.2.1", /* IP address of pluto */
        "port": 1883,
        "username": "root",
        "password": "analog"
      },
      "topic" : "cmd/pluto/call",
      "payload": "ZS1SCI" /* Your callsign */
    }
   ```
4. Double click `DATV-Start.cmd`

5. Press the `set call` button to set your call sign and reboot pluto
  <img width="545" alt="image" src="https://github.com/Psynosaur/DATV-Simple/assets/26934113/350529b3-5a15-48f4-87f2-6a722fce3751">

6. Watch this intro video on [channel calibration](https://youtu.be/-ZdQOVg26_0) and then [usage](https://www.youtube.com/watch?v=8q4WMCyKtKw) and perhaps [reception](https://youtu.be/lz3GO2zCf_Q)

7. Have fun

![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/a37f9ae6-9c41-4a3a-ac5d-13f4de2cca0b)

If you'd like to say thanks, please make a [donation](https://paypal.me/zs1sci?country.x=ZA&locale.x=en_US)

## Thanks 
Batch files previously used in this project were from DL5OCD Michael and his [DATV-NotSoEasy project](https://groups.io/g/plutodvb/message/257)

Node Red flows inspired by project from PE2JKO [from this post](https://www.pg540.org/wiki/index.php/RFE_for_PlutoDVB2)

