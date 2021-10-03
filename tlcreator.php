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
			<button id="open">Open audio</button>
			<button id="importurl" disabled>Import tracklist from URL</button>
			<button id="import" disabled>Import tracklist from text</button>
			<button id="export" disabled>Export to JSON</button>
		</nav>
		<main style="padding-left: 0px; padding-right: 0px;">
			<div id="waveformdata"></div>
			<form id="editor">
				<label for="start">Start second</label>
				<input type="number" id="start" name="start" required />

				<label for="end">End second</label>
				<input type="number" id="end" name="end" required />

				<label for="artists">Artist(s) <small>(separated by commas)</small></label>
				<input type="text" id="artists" name="artists" />

				<label for="title">Title</label>
				<input type="text" id="title" name="title" />

				<label for="title_version">Title version <small>(for remixes etc.)</small></label>
				<input type="text" id="title_version" name="title_version" />

				<label for="radio_section">Radio section <small>(for recurring sections of the programme)</small></label>
				<input type="text" id="radio_section" name="radio_section" />

				<label for="override">Override <small>(overrides all previous fields when displayed in player, use space to display nothing)</small></label>
				<input type="text" id="override" name="override" />

				<label for="skip">Skip <small>(if checked, this segment is skipped during playback)</small></label>
				<input type="checkbox" id="skip" name="skip" />

				<button type="reset" id="delete">Delete current segment</button>
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
	<script>
	window.onbeforeunload = function() {
		return "Are you sure you want to close this tab?";
	};
	</script>
</body>
</html>
