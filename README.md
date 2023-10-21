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

8. Open this [link](http://127.0.0.1:1880/ui/)

9. Watch this intro video on [channel calibration](https://youtu.be/-ZdQOVg26_0) and then [usage](https://www.youtube.com/watch?v=8q4WMCyKtKw)

10. Have fun

![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/0c5f3dba-f538-403c-8cb7-11d5318c5295)

If you want buy me a coffee:

  [paypal.me/zs1sci](https://paypal.me/zs1sci?country.x=ZA&locale.x=en_US)


## Thanks 
Batch files in this project are from DL5OCD Michael and his [DATV-NotSoEasy project](https://groups.io/g/plutodvb/message/257)

Node Red flows inspired by project from PE2JKO [from this post](https://www.pg540.org/wiki/index.php/RFE_for_PlutoDVB2)

![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/ec497e07-81c5-40ed-b6d7-7ec829b30cf7)



## Check libx265 performance 

 Run this bat file.

    .\scripts\ffmpeg_bench_libx265.bat

 ![image](https://github.com/Psynosaur/DATV-Simple/assets/26934113/5d4a27f6-fa75-4bc7-b946-618829cf75c0)
 
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


