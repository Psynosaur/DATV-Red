#!/usr/bin/bash

# Install script by DL5OCD and ZS1SCI

BASEDIR=$(pwd)
cd "$BASEDIR"

echo "This installs all needed components for DATV-Red..."
echo "Run this script as root (sudo ./install)!!!"

echo "If your system is now connected to the Internet, press Enter to continue, else press q to exit."
read CONTINUE
if [ "$CONTINUE" = "q" ]; then
echo "Installation aborted, end."
exit
fi

# cd .. && cd ffmpeg && chmod +x * && cd ..
# chmod +x DATV-Start.sh


#snap install node --classic
apt-get install -y xclip

apt-get install -y v4l-utils

echo "Should the newest version of OBS be installed? Yes (1), No (0)"
read OBS
if [ "$OBS" = "1" ]; then
add-apt-repository ppa:obsproject/obs-studio
apt update
apt-get update && apt-get install -y obs-studio
fi

echo "Should the ALSA-Loopback device be installed? Yes (1), No (0)"
read ALSA
if [ "$ALSA" = "1" ]; then
modprobe snd-aloop
echo snd-aloop >> /etc/modules
fi

echo "Should the udev-rules for OBS be installed? Yes (1), No (0)"
read UDEV
if [ "$UDEV" = "1" ]; then
cd $BASEDIR
cd scripts
cp ./99-obs-vc.rules /etc/udev/rules.d
systemctl restart udev
fi

echo "Installation complete. Have fun...."
exit



