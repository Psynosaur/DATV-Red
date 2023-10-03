# DATV-Simple

## Prerequisite 
- **VERY IMPORTANT** at least passive cooling on the PlutoSDR in the form of heatsinks, or it might explode ¯\_(ツ)_/¯
- Latest beta PlutoSDR [firmware](https://github.com/F5OEO/pluto-ori-ps/wiki)
- **Node-Red** running on windows(temporary)
  
Script in this project is from DL5OCD Michael and his post about it can be found [here](https://groups.io/g/plutodvb/message/257)

Node Red flows shamelessly used from this [post](https://www.pg540.org/wiki/index.php/RFE_for_PlutoDVB2)

## Setup and use
1. Clone this repository

    git clone https://github.com/Psynosaur/DATV-Simple

or download the zip from github by clicking on the blue code button...

2. Setup **config-tx.ini**

3. Use **SET-FAVORITE.bat** to setup profiles 1-7 for each KS...

4. Run node red from the DATV-Simple directory

## Motivation
DATV transmissions normally have the following programs open:
 1. OBS
 2. DATV-Easy/FreeStreamCoder (ffmpeg maker...) < - - - **DATV-Simple**
 3. Panel for operating PlutoSDR  < - - - - - - - - - - - - - - **DATV-Simple**                
 4. OpenTuner / Minitioune < - - - - - We could use opentuner / quicktune spectrum as means to drive tx settings?
 5. QuickTune / Chat

So that is five programs and their child windows we need open just to have TX and RX.

I'd like to make that 3 or perhaps even less, it would be nice to run this on any operating system

![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/dd74788e-d64e-4fdd-9e1f-407c50910402)

TODOs:
 - Add spectrum from BATC as step one
   - Add custom fft sources 
 - Codec selections
 - Identify all variables
 - Set video and audio bitrate calculations from selections
   - Give calculated bitrates on GUI 
 - Store state as JSON and not strings in files
 - Call ffmpeg directly...(take out last of DATV-NotSoEasy bat files)
