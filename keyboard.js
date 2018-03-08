var placeholder = "This is an area where you can take notes... \n\
\n\
Some basic features:\n\
\n\
- [x] monospaced font\n\
  - [x] sort of nice grey colour scheme\n\
  - [x] night mode! (solarized!)\n\
    - [x] night mode switch!\n\
- [x] saved to local storage so it's here when you come back\n\
- [x] tab indents lines\n\
  - [x] shift+tab un-indents\n\
  - [x] new lines have the same starting indentation\n\
- [ ] save / export note to gist"


function setPlaceholder() {
  if (scratchpad.value == '' || scratchpad.value == placeholder) {
    scratchpad.value = placeholder;
    scratchpad.className = 'placeholder';
  }
}
scratchpad.onblur = setPlaceholder;

scratchpad.onfocus = function(e) {
  if (scratchpad.value == placeholder) {
    scratchpad.value = '';
  }
  scratchpad.className = '';
}


scratchpad.onkeyup = function(e) {
  var lines = scratchpad.value.split("\n");

  // new line: auto-indent to same indentation
  if (e.keyCode === 13) {
    var current_line_number = getLineNumber(scratchpad)
    var prev_line = lines[current_line_number - 1];

    if (prev_line.trim().length > 0) {
      var indent = prev_line.length - prev_line.trimLeft().length;
      var pos = scratchpad.selectionStart;
      scratchpad.value = scratchpad.value.slice(0, pos) + " ".repeat(indent) + scratchpad.value.slice(pos);
      scratchpad.setSelectionRange(pos + indent, pos + indent);
    }
  }

  // save on key up if we're not looking at the placeholder text
  if (scratchpad.value != placeholder) {
    localStorage.setItem("scratchpad", scratchpad.value);
  }
}

scratchpad.onkeydown = function(e) {
  var lines = scratchpad.value.split("\n");

  // tab key: indent; shift+tab: un-indent
  if (e.keyCode === 9) {
    e.preventDefault();
    var pos = scratchpad.selectionStart;
    if (!e.shiftKey) {
      scratchpad.value = scratchpad.value.slice(0, pos) + "  " + scratchpad.value.slice(pos);
      scratchpad.setSelectionRange(pos + 2, pos + 2);
    } else {
      // remove up to two white-spaces from the start of the current line
      var current_line_number = getLineNumber(scratchpad)
      var new_value = lines[current_line_number];

      var shift = 0;
      for(i in [1, 2]) {
        if (new_value[0] === ' ') {
          new_value = new_value.slice(1);
          shift++;
        };
      }

      lines[current_line_number] = new_value;
      scratchpad.value = lines.join('\n');
      scratchpad.setSelectionRange(pos - shift, pos - shift);

      // always go back to the start of the line
      if (getLineNumber(scratchpad) != current_line_number) {
        shift--;
        scratchpad.setSelectionRange(pos - shift, pos - shift);

        if (getLineNumber(scratchpad) != current_line_number) {
          shift--;
          scratchpad.setSelectionRange(pos - shift, pos - shift);
        }
      }

    }
  }
}
