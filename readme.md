# Simple Radio Archive

A simple web portal to an even simpler radio show archive.


## How to set up

Make sure you have a web server running with PHP 7 or higher.

Download this repository. Then create a settings.json file, structured like settings.json.example. Place all audio files in the folder specified by you in settings.json (this folder should be a subfolder of the folder where index.php is located). These audio files can be in any format accepted by web browsers. You can add as many stations as you want. Upload everything to your web server.


## File name structure of the audio files

Audio files should have a specific naming scheme. This naming scheme must be set in settings.json and can differ per radio show. An example: for the scheme `RADIO_E%eeee%_%yyyy%_%mm%_%dd%_*.mp3`, all files should start with `RADIO_E`, then have an episode number of 4 characters in length (so 0000 to 9999), followed by an underscore, the year of the broadcast, an underscore, the month of the broadcast, an underscore, the day of the broadcast, an underscore, then anything can follow (as stated by the asterisk). For this example the names must end in `.mp3`.

The asterisk is actually not currently handled by this web portal. You can leave it out, although I do plan on implementing it in the future, so for the sake of it - don't use any asterisks in the filenames! The same goes for percentage signs, obviously.


## How to add new episodes

Simply add the audio files for new episodes to the folder specified in settings.json. Make sure to follow the same naming scheme as described in settings.json. You could automate this process, for example using [streamripper](http://streamripper.sourceforge.net/ "Streamripper is a command line tool that rips internetradio streams").


## Add custom cover art to episodes

To add custom cover art to specific episodes, just place a JPG file in the same folder as the audio file, with the exact same name. The system will use this image file automatically. It does not need to be of any specific size, although a square image is recommended.


## Keyboard shortcuts

- <kbd>K</kbd> <kbd>SPACE</kbd> Play / Pause
- <kbd>,</kbd> Previous episode
- <kbd>.</kbd> Next episode
- <kbd>J</kbd> Seek 10 seconds back
- <kbd>L</kbd> Seek 10 seconds forward
- <kbd>End</kbd> Stop playback
- <kbd>-</kbd> Decrease volume by 10%
- <kbd>+</kbd> Increase volume by 10%
- <kbd>M</kbd> Mute
- <kbd>0</kbd> to <kbd>9</kbd> Set volume, 100%, 0% to 90%
- <kbd>F5</kbd> Refresh


## Browser support

This web portal should work in all major internet browsers (except from Internet Explorer, but if you still see that as a major internet browser, you're stuck in the past).