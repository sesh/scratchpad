function nightMode() {
  document.getElementsByTagName('body')[0].classList = 'night';
  localStorage.setItem("mode", "night");
}

function dayMode() {
  document.getElementsByTagName('body')[0].classList = 'day';
  localStorage.setItem("mode", "day");
}

function getLineNumber(textarea, indicator) {
  return textarea.value.substr(0, textarea.selectionStart).split("\n").length - 1;
}

function jq() {
  try {
    var formatted = JSON.stringify(JSON.parse(scratchpad.value), null, 2);
    scratchpad.value = formatted;
  } catch (e) {
    console.error(e);
  }
}

function getWordAtCurrentPosition() {
  var pos = scratchpad.selectionStart;
  var x = pos;
  var val = scratchpad.value[x];

  // end of document
  if (val === undefined) {
    val = ' ';
  }

  if (!(val === ' ' || val === '\n')) {
    while (!val.endsWith(' ') && !val.endsWith('\n')) {
      x += 1;
      if (x >= scratchpad.value.length)
      {
        break;
      }
      val += scratchpad.value[x];
    }
  }

  val = val.toString().trim();
  x = pos;

  while (!val.startsWith(' ') && !val.startsWith('\n')) {
    x -= 1;
    if (x < 0)
      break;
    val = scratchpad.value[x] + val;
  }

  return val.trim();
}
