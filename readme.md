# Simple Radio Archive

A simple web portal to an even simpler radio show archive. It features an overview of all episodes on the server, as well as a built-in audio player.


## How to set up

Make sure you have a web server running with PHP 7 or higher.

Download this repository. Then create a *.htsettings.json* file, structured like *.htsettings.json.example*. Place all audio files in the folder specified by you in *.htsettings.json* (this folder should be a subfolder of the *audio* folder). These audio files can be in any format accepted by web browsers. You can add as many stations as you want. Upload everything to your web server.


## File name structure of the audio files

Audio files should have a specific naming scheme. This naming scheme must be set in *.htsettings.json* and can differ per radio show. An example: for the scheme `RADIO_E%eeee%_%yyyy%_%mm%_%dd%_*`, all files should start with `RADIO_E`, then have an episode number of 4 characters in length (so 0000 to 9999), followed by an underscore, the year of the broadcast, an underscore, the month of the broadcast, an underscore, the day of the broadcast, an underscore, then anything can follow (as stated by the asterisk).

The asterisk is actually not currently handled by this web portal. You can leave it out, although I do plan on implementing it in the future, so for the sake of it - don't use any asterisks in the filenames! The same goes for percentage signs, obviously.

If you have audio files with different extensions, you must include every extension in the "type" list in *.htsettings.json* (see second show in *.htsettings.json.example*). These should be listed in chronological order (most recently used extensions first).


## How to add new episodes

Simply add the audio files for new episodes to the folder specified in .htsettings.json. Make sure to follow the same naming scheme as described in *.htsettings.json*. You could automate this process, for example using [streamripper](http://streamripper.sourceforge.net/ "Streamripper is a command line tool that rips internetradio streams").


## How to add livestreams

Add a schedule to the .htsettings.json file like in the example.

```
{
  "day": 2          // the day of the week when a broadcast will occur. monday=0, sunday=6
  "hour": 14        // the hour at which the broadcast will start
  "minute": 30      // the minute in that hour at which the broadcast will start
  "duration": 120   // the duration of this broadcast, in minutes
}
```

Add as many schedule listings as you want. Seperate them with commas. If you don't understand how, please look up how JSON formatting works.

After you've added your schedule, you'll need to add at least one livestream URL in the *.htsettings.json* file as well. Look at the example *.htsettings.json* file for an example. In order to play an audiostream directly in the web portal, the stream needs to be non-CORS restricted. If it is not, most major web browsers will refuse to play the content. Users will still be able to open the stream in a new tab though. Also, keep in mind that the first audio stream listed will take priority - if it cannot be played from, the second will be used, and so on.

If you're using streamripper to rip the episode directly into the folder listed in *.htsettings.json*, enable the streamripper fix by setting "streamripper_fix_enabled" to true in *.htsettings.json*. If you do not do this, the livestream will likely display the wrong episode number while ripping the stream, and the incomplete stream rip will be visible in the web portal.


## Add custom cover art to episodes

To add custom cover art to specific episodes, just place a JPG file in the same folder as the audio file, with the exact same name (although the date part is not required). The system will use this image file automatically. It does not need to be of any specific size, although a square image is recommended.


## Add tracklists to episodes

To add tracklists to specific episodes, use the Tracklist Creator tool to generate the necessary files. This tool is available at *YourArchiveUrl/tlcreator/* in any modern web browser. Over here, you can load an episode by clicking "Open Audio" and pasting the URL of the episode you want to create the tracklist for (rightclick the episode in the archive and choose for "copy link"). Then, you can load a tracklist from text, or modify an existing one by importing it from a URL. Use the mouse cursor and the form below the audiowaves to modify the tracklist. Once done, press "Export to JSON" to save the necessary file for this episode. Then place this file in the same folder as the audio files for your radio show.

This process is still in development and is likely to change in the future.


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
