<?php
	$v = "2.5";
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<title>Tracklist Parser</title>
	<style>
		html, body {
			font-family: Roboto, Verdana, Arial, Sans-Serif;
			background-color: #333333;
			color: #EDEDED;
			caret-color: #EDEDED;
			font-size: 15px;
		}

		label {
			display: block;
			font-size: 13px;
		}

		textarea {
			display: block;
			cursor: text;
			font-size: inherit;
			width: 100%;
			height: 400px;
			padding: 8px;
			background: #434343;
			color: inherit;
			border: solid 1px #1A1A1A;
			border-radius: 3px;
			outline: 0;
			transition: 0.4s;
			box-sizing: border-box;
			resize: vertical;
			overflow: hidden auto;
			font-family: inherit;
		}

		textarea:focus {
			border-color: #127940;
			transition: 0.05s;
		}

		button {
			display: block;
			margin-top: 6px;
			width: 100%;
			padding: 12px;
			border: none;
			border-radius: 3px;
			background: #127940;
			transition: 0.4s;
			cursor: pointer;
			color: inherit;
		}

		button:focus,
		button:hover {
			background: #23AD61;
			transition: 0.05s;
		}

		::-moz-selection {
			color: #FFFFFF;
			background-color: rgba(18, 121, 64, 0.99);
			text-shadow: none;
		}

		::selection {
			color: #FFFFFF;
			background-color: rgba(18, 121, 64, 0.99);
			text-shadow: none;
		}
	</style>
	<script>
	var artistsRegex = /\s\&\s|\sand\s|\swith\s|\sx\s|,\s|\svs\s|\svs\.\s|\sversus\s|\smeets\s|\sfeat\s|\sfeat\.\s|\sfeaturing\s|\spres\s|\spres\.\s|\spresents\s+/gm;
	function closeMySelf() {
		var list = [];
		var templist;
		var trackObj = null;
		var tempSection = null;
		var input = document.getElementById("listfield").value;

		input = input.replace(/[\u2018\u2019\u0060\u00b4]/g, "'");
		input = input.replace(/[\u201c\u201d]/g, "\"");
		if (input[0] == '[') {
			try {
				list = JSON.parse(input);
			}
			catch (err) {
				alert("Invalid JSON: " + err.message);
				return;
			}
		}
		else {
			templist = input.split("\n");
			try {
				for (var i = 0; i < templist.length; i++) {
					templist[i] = templist[i].split(/\s-\s|\s–\s+/gm);
					if (templist[i][0].indexOf(":") > -1) {
						tempSection = templist[i][0].split(": ")[0];
						templist[i][0] = templist[i][0].split(": ").pop();
					}
					else {
						tempSection = null;
					}
					templist[i][0] = templist[i][0].split(artistsRegex);
					templist[i][1] = templist[i][1].replace(/\[.*\]+/gm, "");
					templist[i][2] = templist[i][1].substring(templist[i][1].indexOf("(") + 1, templist[i][1].lastIndexOf(")"));
					templist[i][1] = templist[i][1].replace(/\(.*\)+/gm, "");
					for (var j = 0; j < templist[i][0].length; j++) {
						templist[i][0][j] = templist[i][0][j].trim();
					}
					templist[i][1] = templist[i][1].trim();
					templist[i][2] = templist[i][2].trim();
					trackObj = {
						from: 0,
						to: 0,
						artists: templist[i][0],
						title: templist[i][1],
						title_version: templist[i][2],
						radio_section: tempSection,
						override: null,
						skip: false
					};
					list.push(trackObj);
				}
			}
			catch (err) {
				console.error(err);
				alert("An error occurred while parsing track " + (i+1) + ":\n\n" + err.message);
			}
		}
		try {
			console.log(list);
			window.opener.console.log(list);
			window.opener.tlCreator.loadListWithoutTimes(list);
			window.opener.focus();
			window.close();
		}
		catch (err) {
			console.error(err);
		}
		return false;
	}
	</script>
</head>
<body>
<form>
	<label for="listfield">Enter a tracklist below, each track on a new line:</label>
	<textarea id="listfield" name="listfield" placeholder="RADIO SECTION: Artist(s) - Title (Title Version)" autofocus></textarea>
	<button type="submit" onclick="closeMySelf(); return false;" res>Import &amp; parse</button>
</form>
</body>
</html>
