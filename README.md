# DATV-Simple

## Prerequisite 
- DATV-NotSoEasy setup and working...
Original author is DL5OCD Michael and his post about it can be found [here](https://groups.io/g/plutodvb/message/257)

# Node Red flows shamelessly used from here...
From this [post](https://www.pg540.org/wiki/index.php/RFE_for_PlutoDVB2)

## Motivation
Accomodate the need to **manage encoding profiles and tx settings in one place**.

![image](https://github.com/Psynosaur/DATV-NotSoEasy/assets/26934113/a5facd09-ae2b-47af-96a9-f00afbb4c700)

## Setup and use
1. Clone this repository

    git clone https://github.com/Psynosaur/DATV-Simple

or download the zip from github by clicking on the blue code button...

2. Then **replace the files in Michaels DATV-NotSoEasy folder**, with the contents of this project.

3. Use **SET-FAVORITE.bat** to setup profiles 1-7 for each KS...

4. Run node red from the modifed **DATV-NotSoEasy** folder from step 2

TODO:
 - Add spectrum html
 - Codec selection
 - Identify all variables
 - Get Video and Audio bitrate calculations
 - Store last used frequency as file
   - Stored more things that make sense
   - We'd like to pick up where we left of
 - Call ffmpeg directly...
