#!/bin/sh
NC='\033[0m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
LIGHT_PURPLE='\033[1;35m'
YELLOW='\033[0;33m'
GRAY='\033[1;30m'

# printf "${NC}NC\n"
# printf "${BLUE}BLUE\n"
# printf "${RED}RED\n"
# printf "${GREEN}GREEN\n"
# printf "${CYAN}CYAN\n"
# printf "${PURPLE}PURPLE\n"
# printf "${LIGHT_PURPLE}LIGHT PURPLE\n"
# printf "${YELLOW}YELLOW\n"
# printf "${GRAY}GRAY\n"
# printf "${NC}OK...\n"

echo "${CYAN}Audio Housekeeping${NC} Which directory (ie. /home/nte/nodejs/public )?:"
read audio_dir

lines=$(find $audio_dir -name "*.wav" -type f | wc -l)
echo lines

if [ $lines -eq 0 ]; then
        echo "\tNothing found. Exiting..."
else
        printf "${NC}Listing files...\n"
        find $audio_dir -name "*.wav" -type f
        printf "Are you sure?${RED}"
        read -p " (y/n) " RESP
        if [ "$RESP" = "y" ]; then
                find $audio_dir -name "*.wav" -type f -delete
                printf "${GREEN}Done!"
        else
                printf "${BLUE}Exiting..."
        fi
        printf "${NC} :) \n"
fi