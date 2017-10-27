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
