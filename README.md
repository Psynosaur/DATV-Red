# DATV-Red

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

## **Capabilities of DATV-Red**
  - Encoding of TS data (Tx) 
  - Tuning of onboard longmynd server, `requires USB hub` refer to [wiki](https://github.com/F5OEO/pluto-ori-ps/wiki#hardware) (Rx)
    - No further software dependencies, work in progress
  - Operation of PlutoSDR RF modulator parameters (Tx)
  - **DBV-GSE** (Tx & Rx)
    - You can view eachothers dashboard on tunnel IPs
    - Anything that can be done on a normal `LAN`...   
  - (**Windows**) Sends UDP payload to `Minitioune` software control address (Rx)
    - Tunes Minitiouner radio using `Minitioune` software
    - OpenTuner support pending
    - Open a issue and tag it with `enhancement`
      - Provide **as much detail** of your receivers steering command  
  - Optional chat (QoL)
  - Optional SONOFF tasmota support (QoL)
    - WiFi operation, since `Tx` and toggling power of PA are not things that happen together.
    - My SONOFF basic is right next to amp, no issues with interference on `2.435GHz`
  - Cross-platform
   

## Setup and use
1. Download [latest release](https://github.com/Psynosaur/DATV-Red/releases) and extract to folder `DATV-Red` and open in file explorer (you'll need [7zip](https://www.7-zip.org/download.html))

2. **VERY IMPORTANT** Please make sure to place the folder in a path without spaces like: `C:\radio\DATV-Red`

3. Setup mqtt broker in `pluto.json` file change `broker` for pluto and `payload` for callsign
   
   ```json
    {
      "action": "connect",
      "broker": {
        "broker": "192.168.2.1", 
        "port": 1883,
        "username": "root",
        "password": "analog"
      },
      "topic" : "cmd/pluto/call",
      "payload": "ZS1SCI"
    }
   ```
4. Double click `DATV-Start.cmd`

5. Press the `set call` button to set your call sign and reboot pluto
 ![image](https://github.com/Psynosaur/DATV-Red/assets/26934113/414b3359-f798-4938-bc17-af7d0bc135b1)

6. Please refer to the [Wiki](https://github.com/Psynosaur/DATV-Red/wiki) for more setup details

7. Watch this intro video on [channel calibration](https://youtu.be/-ZdQOVg26_0) and then [usage](https://www.youtube.com/watch?v=8q4WMCyKtKw) and perhaps [reception](https://youtu.be/lz3GO2zCf_Q)

8. Have fun

![image](https://github.com/Psynosaur/DATV-Red/assets/26934113/65d57631-6960-48eb-8100-5dca78ddf5e8)

## Thanks 
Batch files previously used in this project were from DL5OCD Michael and his [DATV-NotSoEasy project](https://groups.io/g/plutodvb/message/257)

Node Red flows inspired by project from PE2JKO [from this post](https://www.pg540.org/wiki/index.php/RFE_for_PlutoDVB2)

Thank you to all the testers, **DL5OCD**, **HB9DUG**, **DL2GHM**, **ZS6YI** and all others

## Supporting my hobby
If you'd like to say thanks, please feel free to buy me some [time](https://paypal.me/zs1sci?country.x=ZA&locale.x=en_US)

