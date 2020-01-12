Roon extension: Sleep timer
---------------------------

This extension implements an option to turn playback off for selected zone after specified delay.

Installation:

1. Create a folder where you want to install Roon extensions:
		cd ~/
		mkdir RoonExtensions
		cd ~/RoonExtensions

2. Clone Sleep Timer git repository into this folder:
		git clone https://github.com/bancofan/roon-extension-sleep-timer

3. Goto repository folder:
		cd ~/RoonExtensions/roon-extension-sleep-timer		

4. Install all roon resources used by this extension:
		npm install
5. Run this extension:
		node .

6. Open Roon, go to Settings -> Extensions -> Sleep Timer and select zone and delay and 
   press Save. The timer will start countdown and when it is over, playback on selected zone will be stopped.	
   You can disable already running Sleep Timer by selecting Disable option. 	
