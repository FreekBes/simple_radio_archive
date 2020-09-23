<?php
    function get_filename_struct_part($filename, $filename_struct, $struct_part)
    {
        $p_start = strpos($filename_struct, "%".$struct_part);
        if ($p_start === false)
            return null;
        $offset = substr_count($filename_struct, "%", 0, $p_start);
        $p_end = strpos($filename_struct, "%", $p_start+1);
        if ($p_end === false)
            return substr($filename, $p_start - $offset);
        return (substr($filename, $p_start - $offset, $p_end - $p_start - 1));
    }

    $settings = json_decode(file_get_contents("settings.json"), true);
    $files = null;
    for ($i = 0; $i < count($settings["sources"]); $i++)
    {
        $settings["sources"][$i]["eps"] = array_reverse(glob($settings["sources"][$i]["files"]["folder"] . "/*." . $settings["sources"][$i]["files"]["type"]));
    }

    $eNum = 0;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title><?php echo $settings["title"]; ?></title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="styles.css" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#127940" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="<?php echo $settings["title"]; ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
    <script type="application/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>
<body>
    <header>
        <h1><?php echo $settings["title"]; ?></h1>
    </header>
    <main>
        <?php foreach($settings["sources"] as $source) { ?>
        <div class="source">
            <h2><?php echo($source["metadata"]["name"]); ?></h2>
            <?php
            if (empty($source["eps"]))
                echo '<p>No episodes have been uploaded as of yet.</p>';
            else {
                foreach($source["eps"] as $audio)
                {
                    $ep_num = get_filename_struct_part(basename($audio), $source["files"]["name_struct"], "e");
                    $year = get_filename_struct_part(basename($audio), $source["files"]["name_struct"], "y");
                    $month = get_filename_struct_part(basename($audio), $source["files"]["name_struct"], "m");
                    $day = get_filename_struct_part(basename($audio), $source["files"]["name_struct"], "d");
                    $ep_name = "Episode " . intval($ep_num);
                    $date = $year . "-" . $month . "-" . $day;
                    $coverart = $source["metadata"]["default_img"];
                    if (file_exists(str_replace(".mp3", ".jpg", $audio)))
                    {
                        $coverart = str_replace(".mp3", ".jpg", $audio);
                    }
                    $coverart_dimens = getimagesize($coverart);
                    $coverart_dimens = $coverart_dimens[0] . "x" . $coverart_dimens[1];
                    ?>
                    <a class="ep" href="<?php echo $audio; ?>" data-show="<?php echo $source["metadata"]["name"]; ?>" data-epnum="<?php echo $ep_num; ?>" data-epname="<?php echo $ep_name; ?>" data-art="<?php echo $coverart; ?>" data-artsize="<?php echo $coverart_dimens; ?>" data-date="<?php echo $date; ?>" onclick="event.preventDefault(); aPlayer.open(<?php echo($eNum++); ?>); this.blur(); return false;"><img loading="lazy" src="<?php echo $coverart; ?>" /><b><?php echo $ep_name; ?></b><br><small><?php echo $date; ?></small></a>
                    <?php
                }
            } ?>
        </div>
        <?php } ?>
    </main>
    <footer>
        <div id="seekbarwrapper">
	    	<div id="progressbar-outer">
                <div class="progressbar-inner" id="barbackground"></div>
                <div class="progressbar-inner" id="bufferbar"></div>
                <div class="progressbar-inner" id="progressbar"></div>
            </div>
        </div>
        <div id="playerwrapper">
            <img id="player-art" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
            <button class="player-ctrl material-icons" id="play-pause" onclick="aPlayer.togglePlayPause(); this.blur();">play_circle_outline</button>
            <button class="player-ctrl material-icons" id="skip-next" onclick="aPlayer.next(); this.blur();">skip_next</button>
            <div id="metadata">
                <div id="player-title"></div>
                <div id="player-show"></div>
                <div id="player-extra"></div>
            </div>
            <div id="player-times"></div>
        </div>
    </footer>
    <script type="application/javascript" src="progressbar.js"></script>
    <script type="application/javascript" src="player.js"></script>
    <script type="application/javascript" src="kbd.js"></script>
</body>
</html>