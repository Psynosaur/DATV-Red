# DATV-Simple

## Prerequisite 
- **VERY IMPORTANT** at least passive cooling on the PlutoSDR in the form of heatsinks, or it might explode ¯\_(ツ)_/¯
  - Mine with big chungus metal block heatsink goes upto 45°C
- Latest beta PlutoSDR [firmware](https://github.com/F5OEO/pluto-ori-ps/wiki)
- **Node-Red** running on windows(temporary)
  
![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/4a12c477-cb2b-469c-a591-f167193ddf44)


Batch files in this project are from DL5OCD Michael and his [DATV-NotSoEasy project](https://groups.io/g/plutodvb/message/257)

Node Red flows inspired by project from PE2JKO [from this post](https://www.pg540.org/wiki/index.php/RFE_for_PlutoDVB2)

![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/1a3de07f-3885-4b82-842d-97b378f68937)


## Check libx265 performance 

 Run this bat file.

    .\ffmpeg_bench_libx265.bat

 ![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/5d4a27f6-fa75-4bc7-b946-618829cf75c0)
 
If you get higher than 25fps, you should be okay... 

## Setup and use( I will try automate these steps )
1. Clone this repository

    git clone https://github.com/Psynosaur/DATV-Simple

or download the zip from github by clicking on the blue code button...

2. Setup **config-tx.ini**

3. Use **SET-FAVORITE.bat** to setup profiles 1-7 for each KS...
   
4. Run node red from the DATV-Simple directory or use shortcut

5. Import the tx.json flow

6. Double click cmd/pluto/call node
   
  ![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/c32933b6-1838-48d5-8182-bd6832556803)

7. Then edit icon

  ![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/cd31b629-09ff-4953-bc29-701b3e03edca)

8. Edit Pluto IP and add security credentials for pluto
  
  ![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/7963e16d-c3f1-4a77-b6c8-0c38bd4179fd)

9. Click Update and then Done

10. Then deploy your flow in the top right

  ![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/7cbd2d17-d3d2-45e6-a55d-3872cbf019d9)

11. Then go to http://127.0.0.1:1880/ui/

## Motivation
DATV transmissions normally have the following programs open:
 1. OBS
 2. DATV-Easy/FreeStreamCoder (ffmpeg maker...) < - - - **DATV-Simple**
 3. Panel for operating PlutoSDR  < - - - - - - - - - - - - - - **DATV-Simple**                
 4. OpenTuner / Minitioune < - - - - - We could use opentuner / quicktune spectrum as means to drive tx settings?
 5. QuickTune / Chat

So that is five programs and their child windows we need open just to have TX and RX.

I'd like to make that 3 or perhaps even less, it would be nice to run this on any operating system

### TODOs:
 - Add spectrum from BATC as step one - DONE
   - Add custom fft sources - Maybe
 - Call ffmpeg directly...(take out last of DATV-NotSoEasy bat files)

### 8PSK 333KS 1920x1080 - Exceptional quality 

![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/6d66a89f-3dce-472f-9c38-f6e7aad07dbc)

Tested somewhat successfully to 3MS 16APSK ¯\_(ツ)_/¯
