REM Script for DATV-TX via FFMPEG, by DL5OCD
REM DATV-NotSoEasy

@echo off
setlocal enabledelayedexpansion
SET profile=%1
SET SR=%2
SET MODE=%3
SET FEC=%4
SET IMAGESIZE=%5
SET FPS=%6
SET AUDIO=%7
SET CODEC=%8
SET TSBITRATE=%9
shift
shift
shift
shift
shift
SET VBR=%5
SET FECMODE=%6
SET TXFREQUENCY=%7
SET VBITRATE=%8
SET ABITRATE=%9
SET BASEDIR=%~dp0
cd %BASEDIR%

REM ############## Global configuration ###############
REM Read configuration from config-tx.ini

for /f "delims=" %%i in (.\config-tx.ini) do (
set %%i
 )

@REM This is not original functionality XD
if "%lowlatency%" == "true" (
	set lowlatency1=-tune zerolatency
	set libx265params=-x265-params b-adapt=1
	set libx265preset=
	)
if "%lowlatency%" == "false" (
	set lowlatency1=
	set libx265params=
	set libx265preset=
	)

:DECISIONCODEC
REM Decision Codec
echo %VBR%
if "%FECMODE%"=="variable" if "%VBR%"=="1" GoTo DECISIONCODEC2
if "%CODEC%"=="libvvenc" GoTo VVC
if "%CODEC%"=="libaom-av1" GoTo AV1

if "%CODEC%"=="h264_nvenc" GoTo HARDENC
if "%CODEC%"=="hevc_nvenc" GoTo HARDENC
if "%CODEC%"=="libx264" GoTo SOFTENC
if "%CODEC%"=="libx265" GoTo SOFTENC

:HARDENC

REM Avoid negative timestamps and DTS error
if %SR% GTR 20 if %SR% LSS 36 SET MAXINTERLEAVE=0
SET MAXDELAY=1000
if %SR% GTR 20 if %SR% LSS 36 SET MAXDELAY=2000

echo ------------------------------------------
echo Hardware FFMPEG Encoder H.264/H.265
echo TX-Frequency: %TXFREQUENCY%
echo Gain: %GAIN%
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo Codec: %CODEC%
echo Resolution: %IMAGESIZE%
echo FPS: %FPS%
echo TS-Bitrate: %TSBITRATE%K
echo Videobitrate: %VBITRATE%K
echo Audiobitrate: %ABITRATE%K
echo Buffersize: %BUFSIZE%K
echo Maxdelay: %MAXDELAY%ms
echo Maxinterleave: %MAXINTERLEAVE%s
echo ------------------------------------------

if "%INPUTTYPE%"=="NETWORKUDP" GoTo HWENCNETWORKUDP
if "%INPUTTYPE%"=="NETWORKRTMP" GoTo HWENCNETWORKRTMP
if "%INPUTTYPE%"=="FILE" GoTo HWENCFILE

REM Nvidia-Driver bug: -bf 0 switches of check of B-Frames

REM Hardware encoder via DSHOW
echo|set /p=ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b_ref_mode 0 -bf 0 -b:v %VBITRATE%K -r %FPS% -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYHARD% -rc-lookahead 10 -no-scenecut 1 -zerolatency 1 -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M" > .\ffmpeg_call
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b_ref_mode 0 -bf 0 -b:v %VBITRATE%K -r %FPS% -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYHARD% -rc-lookahead 10 -no-scenecut 1 -zerolatency 1 -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:HWENCNETWORKUDP
REM Hardware encoder via network UDP
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -i %STREAMUDP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b_ref_mode 0 -bf 0 -b:v %VBITRATE%K -r %FPS% -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYHARD% -rc-lookahead 10 -no-scenecut 1 -zerolatency 1 -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:HWENCNETWORKRTMP
REM Hardware encoder via network RTMP
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f flv -listen 1 -i %STREAMRTMP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b_ref_mode 0 -bf 0 -b:v %VBITRATE%K -r %FPS% -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYHARD% -rc-lookahead 10 -no-scenecut 1 -zerolatency 1 -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:SOFTENC

set /a BUFSIZE = %VBITRATE% * %BUFFACTOR%
if %SR% LSS 66 set /a BUFSIZE = (%BUFSIZE% * 3)

REM Avoid negative timestamps and DTS error
if %SR% GTR 20 if %SR% LSS 36 SET MAXINTERLEAVE=0
SET MAXDELAY=1000
if %SR% GTR 20 if %SR% LSS 36 SET MAXDELAY=2000

echo ------------------------------------------
echo Software FFMPEG Encoder H.264/H.265
echo TX-Frequency: %TXFREQUENCY%
echo Gain: %GAIN%
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo Codec: %CODEC%
echo Resolution: %IMAGESIZE%
echo FPS: %FPS%
echo TS-Bitrate: %TSBITRATE%K
echo Videobitrate: %VBITRATE%K
echo Audiobitrate: %ABITRATE%K
echo Buffersize: %BUFSIZE%K
echo Maxdelay: %MAXDELAY%ms
echo Maxinterleave: %MAXINTERLEAVE%s
echo ------------------------------------------

if "%INPUTTYPE%"=="NETWORKUDP" GoTo SWENCNETWORKUDP
if "%INPUTTYPE%"=="NETWORKRTMP" GoTo SWENCNETWORKRTMP
if "%INPUTTYPE%"=="FILE" GoTo SWENCFILE
@REM This is not original functionality XD
@REM echo LOW LATENCY: %lowlatency1%
REM Software encoder via DSHOW
@REM ========================================================================================================================================================================================================== This is not original functionality XD........
echo|set /p=SW: ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% %libx265preset% %libx265params% %lowlatency1% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b:v %VBITRATE%K -r %FPS% -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYSOFT% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M" > .\ffmpeg_call
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% %libx265preset% %libx265params% %lowlatency1% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b:v %VBITRATE%K -r %FPS% -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYSOFT% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"
goto KILLPROCESSES


:SWENCNETWORKUDP
REM Software encoder via network UDP
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -i %STREAMUDP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b:v %VBITRATE%K -r %FPS% -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYSOFT% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:SWENCNETWORKRTMP
REM Software encoder via network RTMP
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f flv -listen 1 -i %STREAMRTMP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b:v %VBITRATE%K -r %FPS% -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYSOFT% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES

:VVC

REM More stable
set /a VBITRATE = %VBITRATE% * 95 / 100

set /a BUFSIZE = %VBITRATE% * %BUFFACTOR%
if %SR% LSS 66 set /a BUFSIZE = (%BUFSIZE% * 3)

REM Avoid negative timestamps and DTS error
if %SR% GTR 20 if %SR% LSS 36 SET MAXINTERLEAVE=0
if %SR% GTR 20 if %SR% LSS 36 SET MAXDELAY=2000
REM More stable
set /a MAXDELAY = %MAXDELAY% * 10

echo -----------------------------------
echo Warning! Experimental VVC Encoder
echo TX-Frequency: %TXFREQUENCY%
echo Gain: %GAIN%
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo Codec: %CODEC%
echo Resolution: %IMAGESIZE%
echo FPS: %FPS%
echo TS-Bitrate: %TSBITRATE%K
echo Videobitrate for VVC: %VBITRATE%K
echo Audiobitrate for VVC: %ABITRATE%K
echo Buffersize for VVC: %BUFSIZE%K
echo Maxdelay for VVC: %MAXDELAY%ms
echo Maxinterleave for VVC: %MAXINTERLEAVE%s
echo -----------------------------------

if "%INPUTTYPE%"=="NETWORKUDP" GoTo VVCENCNETWORKUDP
if "%INPUTTYPE%"=="NETWORKRTMP" GoTo VVCENCNETWORKRTMP
if "%INPUTTYPE%"=="FILE" GoTo VVCENCFILE

REM VVC encoder via DSHOW
echo|set /p=VVC: ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -preset faster -r %FPS% -b:v %VBITRATE%K -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYVVC% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M" > .\ffmpeg_call
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -preset faster -r %FPS% -b:v %VBITRATE%K -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYVVC% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:VVCENCNETWORKUDP
REM VVC encoder via network UDP
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -i %STREAMUDP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -preset faster -r %FPS% -b:v %VBITRATE%K -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYVVC% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:VVCENCNETWORKRTMP
REM VVC encoder via network RTMP
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f flv -listen 1 -i %STREAMRTMP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -preset faster -r %FPS% -b:v %VBITRATE%K -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYVVC% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:AV1

set /a BUFSIZE = %VBITRATE% * %BUFFACTOR%
if %SR% LSS 66 set /a BUFSIZE = (%BUFSIZE% * 3)

REM Avoid negative timestamps and DTS error
if %SR% GTR 20 if %SR% LSS 36 SET MAXINTERLEAVE=0
if %SR% GTR 20 if %SR% LSS 36 SET MAXDELAY=2000
REM Test
set /a MAXDELAY = %MAXDELAY% * 1

echo -----------------------------------
echo Warning! Experimental AV1 Encoder
echo TX-Frequency: %TXFREQUENCY%
echo Gain: %GAIN%
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo Codec: %CODEC%
echo Resolution: %IMAGESIZE%
echo FPS: %FPS%
echo TS-Bitrate: %TSBITRATE%K
echo Videobitrate for AV1: %VBITRATE%K
echo Audiobitrate for AV1: %ABITRATE%K
echo Buffersize for AV1: %BUFSIZE%K
echo Maxdelay for AV1: %MAXDELAY%ms
echo Maxinterleave for AV1: %MAXINTERLEAVE%s
echo -----------------------------------

if "%INPUTTYPE%"=="NETWORKUDP" GoTo AV1ENCNETWORKUDP
if "%INPUTTYPE%"=="NETWORKRTMP" GoTo AV1ENCNETWORKRTMP
if "%INPUTTYPE%"=="FILE" GoTo AV1ENCFILE

REM DVB-GSE container will be the best. Wait for implementation or modify source of ffmpeg to accept AV1 in mpegts
REM -preset 8 -crf 30 -g 300 -usage realtime HDR -colorspace bt2020nc -color_trc smpte2084 -color_primaries bt2020 Test -svtav1-params tune=0 -svtav1-params fast-decode=1

REM AV1 encoder via DSHOW
echo|set /p=AV1: ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -crf %AV1QUAL% -usage realtime -b:v %VBITRATE%K -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYAV1% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M" > .\ffmpeg_call
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -crf %AV1QUAL% -usage realtime -b:v %VBITRATE%K -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYAV1% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:AV1ENCNETWORKUDP
REM AV1 encoder via network UDP
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -i %STREAMUDP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -crf %AV1QUAL% -usage realtime -b:v %VBITRATE%K -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYAV1% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:AV1ENCNETWORKRTMP
REM AV1 encoder via network RTMP
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f flv -listen 1 -i %STREAMRTMP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -crf %AV1QUAL% -usage realtime -b:v %VBITRATE%K -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYAV1% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


REM This section is for VBR

:DECISIONCODEC2
REM Decision Codec
if "%CODEC%"=="libvvenc" GoTo VVC
if "%CODEC%"=="libaom-av1" GoTo AV1

if "%CODEC%"=="h264_nvenc" GoTo HARDENC
if "%CODEC%"=="hevc_nvenc" GoTo HARDENC
if "%CODEC%"=="libx264" GoTo SOFTENC
if "%CODEC%"=="libx265" GoTo SOFTENC



:HARDENC

set /a BUFSIZE = %VBITRATE% * %BUFFACTOR%
if %SR% LSS 66 set /a BUFSIZE = (%BUFSIZE% * 3)

REM Avoid negative timestamps and DTS error
if %SR% GTR 20 if %SR% LSS 36 SET MAXINTERLEAVE=0
if %SR% GTR 20 if %SR% LSS 36 SET MAXDELAY=2000

echo ------------------------------------------
echo VBR-MODE !
echo Hardware FFMPEG Encoder H.264/H.265
echo TX-Frequency: %TXFREQUENCY%
echo Gain: %GAIN%
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo Codec: %CODEC%
echo Resolution: %IMAGESIZE%
echo FPS: %FPS%
echo Videobitrate: %VBITRATE%K
echo Audiobitrate: %ABITRATE%K
echo Maxdelay: %MAXDELAY%ms
echo Maxinterleave: %MAXINTERLEAVE%s
echo ------------------------------------------

if "%INPUTTYPE%"=="NETWORKUDP" GoTo HWENCNETWORKUDP
if "%INPUTTYPE%"=="NETWORKRTMP" GoTo HWENCNETWORKRTMP
if "%INPUTTYPE%"=="FILE" GoTo HWENCFILE

REM Nvidia-Driver bug: -bf 0 switches of check of B-Frames

REM Hardware encoder via DSHOW VBR
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b_ref_mode 0 -bf 0 -b:v %VBITRATE%K -r %FPS% -g %KEYHARD% -rc-lookahead 10 -no-scenecut 1 -zerolatency 1 -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -bufsize %BUFSIZE%K -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:HWENCNETWORKUDP
REM Hardware encoder via network UDP VBR
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -i %STREAMUDP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b_ref_mode 0 -bf 0 -b:v %VBITRATE%K -r %FPS% -g %KEYHARD% -rc-lookahead 10 -no-scenecut 1 -zerolatency 1 -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -bufsize %BUFSIZE%K -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:HWENCNETWORKRTMP
REM Hardware encoder via network RTMP VBR
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f flv -listen 1 -i %STREAMRTMP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b_ref_mode 0 -bf 0 -b:v %VBITRATE%K -r %FPS% -g %KEYHARD% -rc-lookahead 10 -no-scenecut 1 -zerolatency 1 -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -bufsize %BUFSIZE%K -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES



:SOFTENC

set /a BUFSIZE = %VBITRATE% * %BUFFACTOR%
if %SR% LSS 66 set /a BUFSIZE = (%BUFSIZE% * 3)

REM Avoid negative timestamps and DTS error
if %SR% GTR 20 if %SR% LSS 36 SET MAXINTERLEAVE=0
if %SR% GTR 20 if %SR% LSS 36 SET MAXDELAY=2000

echo ------------------------------------------
echo VBR-MODE !
echo Software FFMPEG Encoder H.264/H.265
echo TX-Frequency: %TXFREQUENCY%
echo Gain: %GAIN%
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo Codec: %CODEC%
echo Resolution: %IMAGESIZE%
echo FPS: %FPS%
echo Videobitrate: %VBITRATE%K
echo Audiobitrate: %ABITRATE%K
echo Maxdelay: %MAXDELAY%ms
echo Maxinterleave: %MAXINTERLEAVE%s
echo ------------------------------------------

if "%INPUTTYPE%"=="NETWORKUDP" GoTo SWENCNETWORKUDP
if "%INPUTTYPE%"=="NETWORKRTMP" GoTo SWENCNETWORKRTMP
if "%INPUTTYPE%"=="FILE" GoTo SWENCFILE


REM Software encoder via DSHOW VBR
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b:v %VBITRATE%K -r %FPS% -g %KEYSOFT% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:SWENCNETWORKUDP
REM Software encoder via network UDP VBR
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -i %STREAMUDP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b:v %VBITRATE%K -r %FPS% -g %KEYSOFT% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:SWENCNETWORKRTMP
REM Software encoder via network RTMP VBR
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f flv -listen 1 -i %STREAMRTMP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b:v %VBITRATE%K -r %FPS% -g %KEYSOFT% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES

:VVC

set /a BUFSIZE = %VBITRATE% * %BUFFACTOR%
if %SR% LSS 66 set /a BUFSIZE = (%BUFSIZE% * 3)

REM Avoid negative timestamps and DTS error
if %SR% GTR 20 if %SR% LSS 36 SET MAXINTERLEAVE=0
if %SR% GTR 20 if %SR% LSS 36 SET MAXDELAY=2000
REM More stable
set /a MAXDELAY = %MAXDELAY% * 10

echo -----------------------------------
echo VBR-MODE !
echo Warning! Experimental VVC Encoder
echo TX-Frequency: %TXFREQUENCY%
echo Gain: %GAIN%
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo Codec: %CODEC%
echo Resolution: %IMAGESIZE%
echo FPS: %FPS%
echo Videobitrate for VVC: %VBITRATE%K
echo Audiobitrate for VVC: %ABITRATE%K
echo Maxdelay for VVC: %MAXDELAY%ms
echo Maxinterleave for VVC: %MAXINTERLEAVE%s
echo -----------------------------------

if "%INPUTTYPE%"=="NETWORKUDP" GoTo VVCENCNETWORKUDP
if "%INPUTTYPE%"=="NETWORKRTMP" GoTo VVCENCNETWORKRTMP
if "%INPUTTYPE%"=="FILE" GoTo VVCENCFILE


REM VVC encoder via DSHOW VBR
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -preset faster -r %FPS% -b:v %VBITRATE%K -g %KEYVVC% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:VVCENCNETWORKUDP
REM VVC encoder via network UDP VBR
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -i %STREAMUDP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -preset faster -r %FPS% -b:v %VBITRATE%K -g %KEYVVC% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:VVCENCNETWORKRTMP
REM VVC encoder via network RTMP VBR
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f flv -listen 1 -i %STREAMRTMP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -preset faster -r %FPS% -b:v %VBITRATE%K -g %KEYVVC% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:AV1

set /a BUFSIZE = %VBITRATE% * %BUFFACTOR%
if %SR% LSS 66 set /a BUFSIZE = (%BUFSIZE% * 3)

REM Avoid negative timestamps and DTS error
if %SR% GTR 20 if %SR% LSS 36 SET MAXINTERLEAVE=0
if %SR% GTR 20 if %SR% LSS 36 SET MAXDELAY=2000
REM Test
set /a MAXDELAY = %MAXDELAY% * 1

echo -----------------------------------
echo VBR-MODE !
echo Warning! Experimental AV1 Encoder
echo TX-Frequency: %TXFREQUENCY%
echo Gain: %GAIN%
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo Codec: %CODEC%
echo Resolution: %IMAGESIZE%
echo FPS: %FPS%
echo Videobitrate for AV1: %VBITRATE%K
echo Audiobitrate for AV1: %ABITRATE%K
echo Maxdelay for AV1: %MAXDELAY%ms
echo Maxinterleave for AV1: %MAXINTERLEAVE%s
echo -----------------------------------

if "%INPUTTYPE%"=="NETWORKUDP" GoTo AV1ENCNETWORKUDP
if "%INPUTTYPE%"=="NETWORKRTMP" GoTo AV1ENCNETWORKRTMP
if "%INPUTTYPE%"=="FILE" GoTo AV1ENCFILE

REM DVB-GSE container will be the best. Wait for implementation or modify source of ffmpeg to accept AV1 in mpegts
REM -preset 8 -crf 30 -g 300 -usage realtime HDR -colorspace bt2020nc -color_trc smpte2084 -color_primaries bt2020 Test -svtav1-params tune=0 -svtav1-params fast-decode=1

REM AV1 encoder via DSHOW VBR
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -crf %AV1QUAL% -usage realtime -b:v %VBITRATE%K -g %KEYAV1% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"


goto KILLPROCESSES


:AV1ENCNETWORKUDP
REM AV1 encoder via network UDP VBR
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -i %STREAMUDP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -crf %AV1QUAL% -usage realtime -b:v %VBITRATE%K -g %KEYAV1% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES


:AV1ENCNETWORKRTMP
REM AV1 encoder via network RTMP VBR
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f flv -listen 1 -i %STREAMRTMP% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -crf %AV1QUAL% -usage realtime -b:v %VBITRATE%K -g %KEYAV1% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

goto KILLPROCESSES

:KILLPROCESSES
pause

exit