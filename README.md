# DATV-NotSoEasy
Original author is DL5OCD Michael and his post about it can be found [here](https://groups.io/g/plutodvb/message/257)

# Node Red flows
From this [post](https://www.pg540.org/wiki/index.php/RFE_for_PlutoDVB2)

This repository focuses on **TX flows**

## Motivation
Opening and closing batch scripts can be very time consuming.

![image](https://github.com/Psynosaur/DATV-NotSoEasy/assets/26934113/a5facd09-ae2b-47af-96a9-f00afbb4c700)

This repository is my amalgamation of these two things with the focus on the TX front-end

The first commit of this post is ​DATV-NotSoEasy V1.0 as provided from Michael's post

From here I will commit my changes so they can be tracked

## ffmpeg, Linux-version, Mosquitto and MPV directories ignored

Please use **SET-FAVORITE.bat** to setup profiles 1-7.

![image](https://github.com/Psynosaur/DATV-NotSoEasy/assets/26934113/cabc0f57-f57d-401f-8034-fab025e571d1)

TODO:
 - Add spectrum html
 - Codec selection
 - Identify all variables
 - Get Video and Audio bitrate calculations
 - Store last used frequency as file
   - Stored more things that make sense
   - We'd like to pick up where we left of
 - Call ffmpeg directly...