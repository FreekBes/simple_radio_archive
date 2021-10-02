<?php
	$v = "2.5";
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<title>Tracklist Creator</title>
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="styles.css?v=<?php echo $v; ?>" />
	<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
	<link rel="icon" type="image/ico" href="favicon.ico" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="theme-color" content="#127940" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-title" content="Tracklist Creator" />
	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
	<script type="application/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
	<script type="application/javascript" src="https://unpkg.com/wavesurfer.js"></script>
	<script type="application/javascript" src="https://unpkg.com/wavesurfer.js/dist/plugin/wavesurfer.regions.js"></script>
	<script type="application/javascript" src="useful.js?v=<?php echo $v; ?>"></script>
</head>
<body style="max-width: inherit;">
	<div id="contents" style="max-width: inherit;">
		<header>
			<h1>Tracklist Creator</h1>
		</header>
		<nav>
			<button id="open">Open</button>
			<button id="import" disabled>Import</button>
		</nav>
		<main style="padding-left: 0px; padding-right: 0px;">
			<div id="waveformdata"></div>
			<form id="editor">
			</form>
		</main>
	</div>
	<div id="loading" style="display: table; width: 100%; height: 100%; position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: rgba(0,0,0,0.8); z-index: 100;">
		<div style="display: table-cell; vertical-align: middle;">
			<div style="margin-left: auto; margin-right: auto; text-align: center;">
				<div id="spinner"></div>
				<div id="loadingtext"></div>
			</div>
		</div>
	</div>
	<script type="application/javascript" src="tlcreator.js?v=<?php echo $v; ?>"></script>
</body>
</html>
