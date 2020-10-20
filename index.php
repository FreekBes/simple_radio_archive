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

    function get_next_broadcast_times($schedule)
    {
        $daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        $nextStart = 0;
        $nextEnd = 0;
        $nextDuration = 0;
        $curWeekDay = intval(date("N")) - 1;
        for ($i = 0; $i < count($schedule); $i++)
        {
            $temp = strtotime($schedule[$i]["hour"].':'.$schedule[$i]["minute"]);
            if ($curWeekDay != $schedule[$i]["day"] || $schedule[$i]["duration"] * 60 + $temp < time())
            {
                $temp = strtotime('next '.$daysOfWeek[$schedule[$i]["day"]].' '.$schedule[$i]["hour"].':'.$schedule[$i]["minute"]);
            }
            if ($temp < $nextStart || $nextStart == 0)
            {
                $nextStart = $temp;
                $nextDuration = $schedule[$i]["duration"];
            }
        }
        $nextEnd = strtotime('+'.$nextDuration.' minutes', $nextStart);
        return array($nextStart, $nextEnd);
    }

    function add_live_episode($schedule, $stream_url, $station, $showname, $ep_num, $coverart, $is_live)
    {
        if (count($schedule) > 0 && !empty($stream_url))
        {
            $times = get_next_broadcast_times($schedule);
            $date = date("Y-m-d", $times[0]);
            $ep_name = "Episode " . intval($ep_num);
            $coverart_dimens = getimagesize($coverart);
            $coverart_dimens = $coverart_dimens[0] . "x" . $coverart_dimens[1];
            echo '<a '.($is_live ? '' : 'style="display: none;" ').'class="live" href="'.$stream_url.'" data-schedule="'.implode('/', $times).'" data-schedule-readable="'.date("Y-m-d H:i:s", $times[0]).'/'.date("Y-m-d H:i:s", $times[1]).'" data-radio="'.$station.'" data-show="'.$showname.'" data-epnum="'.$ep_num.'" data-epname="'.$ep_name.'" data-art="'.$coverart.'" data-artsize="'.$coverart_dimens.'" data-date="'.$date.'" onclick="event.preventDefault(); aPlayer.openLive(this); this.blur(); return false;"><img loading="lazy" src="'.$coverart.'" /><b>'.$ep_name.'</b><br><small><i>Live right now!</i></small></a>';
        }
    }

    $settings = json_decode(file_get_contents("settings.json"), true);
    $files = null;
    for ($i = 0; $i < count($settings["sources"]); $i++)
    {
        $settings["sources"][$i]["eps"] = array_reverse(glob($settings["sources"][$i]["files"]["folder"] . "/*.{" . implode(",", $settings["sources"][$i]["files"]["type"]) . "}", GLOB_BRACE));
    }

    $eNum = 0;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title><?php echo $settings["title"]; ?></title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="styles.css" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
	<link rel="icon" type="image/ico" href="favicon.ico" />
    <meta name="debug-time" content="<?PHP echo date("Y-m-d H:i:s"); ?>" />
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
            <h2 name="<?php echo(strtolower($source["metadata"]["short_name"])); ?>" id="<?php echo(strtolower($source["metadata"]["short_name"])); ?>"><?php echo($source["metadata"]["name"]); ?></h2>
            <?php if (count($source["metadata"]["source"]["schedule"]) > 0) { ?>
                <?php $schedule = get_next_broadcast_times($source["metadata"]["source"]["schedule"]); ?>
                <p class="next-broadcast">The <b>next broadcast</b> will be on <b><?php echo date("l", $schedule[0]); ?> the <?php echo date("jS", $schedule[0]); ?>, at <?php echo date("g:i A", $schedule[0]); ?></b>. You will be able to listen to the broadcast live, right here!</p>
            <?php
            }
            if (empty($source["eps"]))
            {
                add_live_episode($source["metadata"]["source"]["schedule"], $source["metadata"]["source"]["livestream_url"], $source["metadata"]["source"]["name"], $source["metadata"]["name"], 1, $source["metadata"]["default_img"], false);
                echo '<p class="no-eps">No episodes have been uploaded as of yet.</p>';
            }
            else {
                $firstAdded = false;
                foreach($source["eps"] as $audio)
                {
                    $ext = pathinfo($audio, PATHINFO_EXTENSION);
                    $ep_num = get_filename_struct_part(basename($audio), $source["files"]["name_struct"], "e");
                    $year = get_filename_struct_part(basename($audio), $source["files"]["name_struct"], "y");
                    $month = get_filename_struct_part(basename($audio), $source["files"]["name_struct"], "m");
                    $day = get_filename_struct_part(basename($audio), $source["files"]["name_struct"], "d");
                    $ep_name = "Episode " . intval($ep_num);
                    $date = $year . "-" . $month . "-" . $day;
                    $coverart = $source["metadata"]["default_img"];
                    if (file_exists(str_replace(".".$ext, ".jpg", $audio)))
                    {
                        $coverart = str_replace(".".$ext, ".jpg", $audio);
                    }
                    else if (file_exists($source["files"]["folder"]."/".$source["metadata"]["short_name"]."_".$source["metadata"]["language"]."_E".$ep_num.".jpg"))
                    {
                        $coverart = $source["files"]["folder"]."/".$source["metadata"]["short_name"]."_".$source["metadata"]["language"]."_E".$ep_num.".jpg";
                    }
                    $coverart_dimens = getimagesize($coverart);
                    $coverart_dimens = $coverart_dimens[0] . "x" . $coverart_dimens[1];
                    if (!$firstAdded && count($source["metadata"]["source"]["schedule"]) > 0)
                    {
                        $firstAdded = true;
                        if (time() >= $schedule[0] && time() < $schedule[1] && $source["metadata"]["source"]["streamripper_fix_enabled"])
                        {
                            add_live_episode($source["metadata"]["source"]["schedule"], $source["metadata"]["source"]["livestream_url"], $source["metadata"]["source"]["name"], $source["metadata"]["name"], $ep_num, $source["metadata"]["default_img"], true);
                            continue;
                        }
                        else {
                            add_live_episode($source["metadata"]["source"]["schedule"], $source["metadata"]["source"]["livestream_url"], $source["metadata"]["source"]["name"], $source["metadata"]["name"], $ep_num+1, $source["metadata"]["default_img"], false);
                        }
                    }
                    ?>
                    <a class="ep" href="<?php echo $audio; ?>" data-show="<?php echo $source["metadata"]["name"]; ?>" data-epnum="<?php echo $ep_num; ?>" data-epname="<?php echo $ep_name; ?>" data-art="<?php echo $coverart; ?>" data-artsize="<?php echo $coverart_dimens; ?>" data-date="<?php echo $date; ?>" onclick="event.preventDefault(); aPlayer.open(<?php echo($eNum++); ?>); this.blur(); return false;"><img loading="lazy" src="<?php echo $coverart; ?>" /><b><?php echo $ep_name; ?></b><br><small><?php echo $date; ?></small></a>
                    <?php
                }
            } ?>
        </div>
        <?php } ?>
        <script>
        setInterval(function() {
            var livestreams = document.getElementsByClassName("live");
            var curTimestamp = Math.floor(new Date().getTime() / 1000);
            for (c = 0; c < livestreams.length; c++)
            {
                var schedule = livestreams[c].getAttribute("data-schedule").split("/");
                if (curTimestamp >= schedule[0] && curTimestamp <= schedule[1])
                {
                    livestreams[c].style.display = "inline-block";
                    livestreams[c].className = "live anim";
                }
                else
                {
                    livestreams[c].style.display = "none";
                    livestreams[c].className = "live";
                }
            }
        }, 1000);
        </script>
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