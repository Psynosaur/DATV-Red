# DATV-Simple

## Prerequisite 
- **VERY IMPORTANT** at least passive cooling on the PlutoSDR in the form of heatsinks, or it might explode ¯\_(ツ)_/¯
- Latest beta PlutoSDR [firmware](https://github.com/F5OEO/pluto-ori-ps/wiki)
- DATV-NotSoEasy setup and working...**(temporary)**

Original author is DL5OCD Michael and his post about it can be found [here](https://groups.io/g/plutodvb/message/257)

Node Red flows shamelessly used from this [post](https://www.pg540.org/wiki/index.php/RFE_for_PlutoDVB2)

## Motivation
Accomodate the need to **manage encoding profiles and tx settings in one place**.

![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/2afba98e-6894-422f-951f-c2a4c1c3e7a9)

## Setup and use
1. Clone this repository

    git clone https://github.com/Psynosaur/DATV-Simple

or download the zip from github by clicking on the blue code button...

2. Use **SET-FAVORITE.bat** to setup profiles 1-7 for each KS...

3. Run node red from the DATV-Simple directory

TODO:
 - Add spectrum html
 - Codec selection
 - Identify all variables
 - Get Video and Audio bitrate calculations
 - Call ffmpeg directly...
