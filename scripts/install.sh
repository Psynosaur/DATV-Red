#!/usr/bin/bash

# Install script by DL5OCD

BASEDIR=$(pwd)
cd $BASEDIR

echo "This installs all needed components for DATV-NotSoEasy..."
echo "Run this script as root!!!"

echo "If your system is now connected to the Internet, press Enter to continue, else press q to exit."
read CONTINUE
if [ "$CONTINUE" = "q" ]; then
echo "Installation aborted, end."
exit
fi

echo "Should the delivered FFMPEG-Version be copied to your system? Yes (1), No (0)"
read COPY
if [ "$COPY" = "1" ]; then
cd ffmpeg
cp ./ffmpeg /usr/local/bin
cp ./ffplay /usr/local/bin
fi

apt-get install -y xfce4-terminal

snap install mqtt-explorer

apt-get install -y mosquitto-clients

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

Echo "Installation complete. Have fun...."
exit



