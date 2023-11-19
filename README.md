# DATV-Simple

## Prerequisite 
- **VERY IMPORTANT** at least passive cooling on the PlutoSDR in the form of heatsinks, or it might explode ¯\_(ツ)_/¯
  - Mine with big chungus metal block heatsink goes upto 45°C
- Latest beta PlutoSDR [firmware](https://github.com/F5OEO/pluto-ori-ps/wiki)

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
  ![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/59a106a8-2063-4f72-ae8d-886202121e3d)

6. Watch this intro video on [channel calibration](https://youtu.be/-ZdQOVg26_0) and then [usage](https://www.youtube.com/watch?v=8q4WMCyKtKw) and perhaps [reception](https://youtu.be/lz3GO2zCf_Q)

7. Have fun

![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/b44b10b4-16cf-4f26-9870-aa05610a9f09)


If you'd like to buy me a coffee ☕️☕️☕:

  [paypal.me/zs1sci](https://paypal.me/zs1sci?country.x=ZA&locale.x=en_US)

## Thanks 
Batch files previously used in this project were from DL5OCD Michael and his [DATV-NotSoEasy project](https://groups.io/g/plutodvb/message/257)

Node Red flows inspired by project from PE2JKO [from this post](https://www.pg540.org/wiki/index.php/RFE_for_PlutoDVB2)


## Motivation
DATV transmissions normally have the following programs open:
 1. OBS
 2. DATV-Easy/FreeStreamCoder (ffmpeg maker...) < - - - **DATV-Simple**
 3. Panel for operating PlutoSDR  < - - - - - - - - - - - - - - **DATV-Simple**                
 4. OpenTuner / Minitioune < - - - - - - - - - - - - - - **DATV-Simple** tunes Minitioune, perhaps OT too [Tom](https://github.com/tomvdb) ?
 5. QuickTune / Chat < - - - - - - - - - - - - - - - - - - **DATV-Simple**




