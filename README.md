# DATV-Simple

## Prerequisite 
- **VERY IMPORTANT** at least passive cooling on the PlutoSDR in the form of heatsinks, or it might explode ¯\_(ツ)_/¯
  - Mine with big chungus metal block heatsink goes upto 45°C
- Latest beta PlutoSDR [firmware](https://github.com/F5OEO/pluto-ori-ps/wiki)
- **Node-Red** running on Windows

## Setup and use
1. Download [this repository](https://github.com/Psynosaur/DATV-Simple/archive/refs/heads/main.zip) and extract to folder `DATV-Simple` and open in file explorer

2. **VERY IMPORTANT**
   - Setup `config-tx.ini` by chaning values for your setup 

4. **PLEASE IGNORE IF Node-Red is installed!**
   - Run `.\install_node_red_RUN_AS_ADMIN.bat` to install Node-Red for Windows
   
5. Run node red using shortcut in folder

6. Please check this setup video: [setup](https://www.youtube.com/watch?v=H9hI2qRMb-A) for importing the flow

7. Once you have imported the flow please run `.\install_dependencies.bat` to ensure the flow has all its dependencies.

8. Open this [link](http://127.0.0.1:1880/ui/) and install from browser by click this icon

   ![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/f5a2950f-0524-47bf-87e0-bdaa8be0e7ef)


10. Watch this intro video on [channel calibration](https://youtu.be/-ZdQOVg26_0) and then [usage](https://www.youtube.com/watch?v=8q4WMCyKtKw) and perhaps [reception](https://youtu.be/lz3GO2zCf_Q)

11. Have fun

![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/029e09e3-673f-4aff-948c-446625b9d4fe)
[Discord](https://discord.gg/szQKjRZvuZ) channel for latest developments. . . (yes its better than IRC)

If you want buy me a coffee:

  [paypal.me/zs1sci](https://paypal.me/zs1sci?country.x=ZA&locale.x=en_US)

## Thanks 
Batch files in this project are from DL5OCD Michael and his [DATV-NotSoEasy project](https://groups.io/g/plutodvb/message/257)

Node Red flows inspired by project from PE2JKO [from this post](https://www.pg540.org/wiki/index.php/RFE_for_PlutoDVB2)

![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/7e3df566-6321-43ee-9fdd-a078e82543e4)

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


