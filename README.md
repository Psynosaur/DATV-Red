# DATV-Simple

## Prerequisite 
- **VERY IMPORTANT** at least passive cooling on the PlutoSDR in the form of heatsinks, or it might explode ¯\_(ツ)_/¯
  - Mine with big chungus metal block heatsink goes upto 45°C
- Latest beta PlutoSDR [firmware](https://github.com/F5OEO/pluto-ori-ps/wiki)

## Setup and use
1. Download [latest relase](https://github.com/Psynosaur/DATV-Simple/releases/download/release-v2.2/DATV-Simple.zip) and extract to folder `DATV-Simple` and open in file explorer

2. double click `DATV-Start.cmd`

3. setup mqtt broker `pluto connection`
   ![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/a6d07612-692a-47a5-a356-7e71cf7dbfbe)

4. Watch this intro video on [channel calibration](https://youtu.be/-ZdQOVg26_0) and then [usage](https://www.youtube.com/watch?v=8q4WMCyKtKw) and perhaps [reception](https://youtu.be/lz3GO2zCf_Q)

5. Have fun

![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/daa3c083-87ae-4f42-96bd-d85f42420806)

[Discord](https://discord.gg/szQKjRZvuZ) channel for latest developments. . . 

If you want buy me a coffee:

  [paypal.me/zs1sci](https://paypal.me/zs1sci?country.x=ZA&locale.x=en_US)

## Thanks 
Batch files in this project are from DL5OCD Michael and his [DATV-NotSoEasy project](https://groups.io/g/plutodvb/message/257)

Node Red flows inspired by project from PE2JKO [from this post](https://www.pg540.org/wiki/index.php/RFE_for_PlutoDVB2)

![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/43f58192-bda8-46ee-b5a8-b5b300147a29)

## Check libx265 performance 

 Run this bat file.

    .\scripts\ffmpeg_bench_libx265.bat

 ![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/7b0f2884-7064-4dcd-bbbf-fffbaf93f032)
 
If you get higher than 25fps, you should be okay... 

## Motivation
DATV transmissions normally have the following programs open:
 1. OBS
 2. DATV-Easy/FreeStreamCoder (ffmpeg maker...) < - - - **DATV-Simple**
 3. Panel for operating PlutoSDR  < - - - - - - - - - - - - - - **DATV-Simple**                
 4. OpenTuner / Minitioune < - - - - - We could use opentuner / quicktune spectrum as means to drive tx settings?
 5. QuickTune / Chat

So that is five programs and their child windows we need open just to have TX and RX.

I'd like to make that 3 or perhaps even less, it would be nice to run this on any operating system


