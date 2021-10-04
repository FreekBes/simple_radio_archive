<?php
	error_reporting(E_ALL); ini_set('display_errors', 1);
	session_start();
	date_default_timezone_set('UTC');

	$settings = json_decode(file_get_contents(".htsettings.json"), true);
	$appKey = $settings["scrobbler"]["api_key"];
	$appSig = $settings["scrobbler"]["api_secret"];

	function signLastFM($params, $secret) {
		$ss = "";
		$st = array_keys($params);
		sort($st);
		for ($i = 0; $i < count($st); $i++) {
			if (!is_array($params[$st[$i]])) {
				$ss .= $st[$i] . $params[$st[$i]];
			}
			else {
				$c2 = count($params[$st[$i]]);
				for ($j = 0; $j < $c2; $j++) {
					$ss .= $st[$i]."[".$j."]" . $params[$st[$i]][$j];
				}
			}
		}
		$ss .= $secret;
		$hashed_sec = md5($ss);
		$params['api_sig'] = $hashed_sec;
		return $params;
	}

	function curlSetOptLastFM($ch, $postData) {
		curl_setopt($ch, CURLOPT_URL,"http://ws.audioscrobbler.com/2.0/");
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
		curl_setopt($ch, CURLOPT_USERAGENT, 'FBSimpleRadioArchive/2.5');
		curl_setopt($ch, CURLOPT_REFERER, 'https://'.$_SERVER['HTTP_HOST'].'/');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	}

	if (isset($_GET["check"])) {
		if (!isset($_SESSION["lastfm_access_token"]) || empty($_SESSION["lastfm_access_token"])) {
			header("Location: http://www.last.fm/api/auth/?api_key=".urlencode($appKey)."&cb=".urlencode('http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF']));
			http_response_code(302);
		}
		else {
			header("Location: ?connected=true");
			http_response_code(303);
		}
	}
	else if (isset($_GET["connected"])) {
		?>
		<script>
			window.opener.scrobbler.enabled = true;
			window.opener.focus();
			window.close();
		</script>
		<?php
	}
	else if (isset($_GET["updatenp"])) {
		if (!isset($_SESSION["lastfm_access_token"]) || empty($_SESSION["lastfm_access_token"])) {
			echo '<b>Could not scrobble track.</b><br>Details: no Last.fm access token was found in the current session. Please re-authenticate.';
			http_response_code(400);
			exit();
		}
		if (!isset($_GET["artist"]) || !isset($_GET["duration"]) || !isset($_GET["title"])) {
			echo '<b>Could not scrobble track.</b><br>Details: missing GET parameters (artist, duration, title are required).';
			http_response_code(400);
			exit();
		}
		$ch = curl_init();

		$postData = signLastFM(array(
			'artist' => $_GET["artist"],
			'api_key' => $appKey,
			'duration' => $_GET["duration"],
			'method' => "track.updateNowPlaying",
			'sk' =>  $_SESSION["lastfm_access_token"],
			'track' => $_GET["title"]
		), $appSig);
		curlSetOptLastFM($ch, $postData);
		$response = curl_exec($ch);
		curl_close($ch);

		if ($response !== false) {
			http_response_code(200);
		}
		else {
			http_response_code(500);
		}
		echo $response;
	}
	else if (isset($_GET["scrobble"])) {
		if (!isset($_SESSION["lastfm_access_token"]) || empty($_SESSION["lastfm_access_token"])) {
			echo '<b>Could not scrobble track.</b><br>Details: no Last.fm access token was found in the current session. Please re-authenticate.';
			http_response_code(400);
			exit();
		}
		if (!isset($_GET["artist"]) || !isset($_GET["duration"]) || !isset($_GET["title"])) {
			echo '<b>Could not scrobble track.</b><br>Details: missing GET parameters (artist, duration, title are required).';
			http_response_code(400);
			exit();
		}
		$ch = curl_init();

		$postData = signLastFM(array(
			'artist' => $_GET["artist"],
			'api_key' => $appKey,
			'chosenByUser' => 0,
			'duration' => $_GET["duration"],
			'method' => "track.scrobble",
			'sk' =>  $_SESSION["lastfm_access_token"],
			'track' => $_GET["title"],
			'timestamp' => time() - intval($_GET["duration"])
		), $appSig);
		curlSetOptLastFM($ch, $postData);
		$response = curl_exec($ch);
		curl_close($ch);

		if ($response !== false) {
			http_response_code(200);
		}
		else {
			http_response_code(500);
		}
		echo $response;
	}
	else if (isset($_SESSION["lastfm_access_token"]) && !empty($_SESSION["lastfm_access_token"]) && !isset($_GET["forced"])) {
		echo "<b>Already connected to Last.fm</b>";
		header("Location: ?connected=true");
		http_response_code(303);
	}
	else if (isset($_GET['token'])) {
		$ch = curl_init();

		$postData = signLastFM(array(
			'api_key' => $appKey,
			'method' => "auth.getSession",
			'token' => $_GET["token"]
		), $appSig);
		
		curlSetOptLastFM($ch, $postData);
		
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		
		$response = curl_exec($ch);
		
		curl_close($ch);

		if ($response !== false) {
			$xml = simplexml_load_string($response);
			$_SESSION["lastfm_access_token"] = (string)$xml->session->key;
			echo "<b>Connected to Last.fm successfully</b>";
			http_response_code(201);
			header("Location: ?connected=true");
		}
		else {
			echo '<b>Could not connect Last.fm.</b><br>Details: could not exchange authorization code for access token.<br>Response:<br><br>';
			echo $response;
			http_response_code(500);
		}
	}
	else {
		echo '<b>Could not connect Last.fm.</b><br>Details: an unknown error occurred.';
		http_response_code(500);
	}
?>