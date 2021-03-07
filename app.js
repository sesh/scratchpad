let removeError = () => {
    let el = document.querySelector('#errors');
    el.parentNode.removeChild(el);
}

let displayError = (message) => {
    let el = document.createElement('div');
    el.id = "errors";
    el.innerText = message;
    el.onclick = removeError;
    document.querySelector('body').appendChild(el);
};

let getLineNumber = (textarea) => {
    return textarea.value.substr(0, textarea.selectionStart).split("\n").length - 1;
};

let replaceSelection = (textarea, value) => {
    var pos = textarea.selectionStart;
    textarea.value = textarea.value.slice(0, pos) + value + textarea.value.slice(textarea.selectionEnd);
    textarea.focus();
    textarea.setSelectionRange(pos + value.length, pos + value.length);
}

let loadFromLocalStorage = (scratchpad) => {
    // ensure we keep the same night / day mode
    if (localStorage.getItem("mode") == "night") {
        document.getElementsByTagName('body')[0].classList = 'night';
    }

    if (localStorage.getItem("duospace") === '1') {
        duospace();
    }

    // load the scratchpad content if it's there
    if (localStorage.getItem("scratchpad")) {
        scratchpad.value = localStorage.getItem("scratchpad");
    }
}

let saveToLocalStorage = (scratchpad) => {
    localStorage.setItem("scratchpad", scratchpad.value);

    if (scratchpad.onsave) {
        scratchpad.onsave(scratchpad);
    }
}

let indentNewline = (scratchpad) => {
    let lines = scratchpad.value.split("\n");
    let current_line_number = getLineNumber(scratchpad)
    let prev_line = lines[current_line_number - 1];

    if (prev_line.trim().length > 0) {
        let indent = prev_line.length - prev_line.trimLeft().length;
        let pos = scratchpad.selectionStart;
        scratchpad.value = scratchpad.value.slice(0, pos) + " ".repeat(indent) + scratchpad.value.slice(pos);
        scratchpad.setSelectionRange(pos + indent, pos + indent);
    }
}

let continueListOnNewline = (scratchpad) => {
    let lines = scratchpad.value.split("\n");
    let current_line_number = getLineNumber(scratchpad)

    let prev_line = lines[current_line_number - 1];
    prev_line = prev_line.trimLeft();

    if (["-", "*"].indexOf(prev_line[0]) >= 0) {
        let pos = scratchpad.selectionStart;
        scratchpad.value = scratchpad.value.slice(0, pos) + prev_line[0] + " " + scratchpad.value.slice(pos);
        scratchpad.setSelectionRange(pos + 2, pos + 2);
    }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

let sortLines = (scratchpad) => {
    let lines = scratchpad.value.split("\n");
    shuffleArray(lines);
    scratchpad.value = lines.join("\n");
}

let shuffleLines = (scratchpad) => {
    let lines = scratchpad.value.split("\n");
    lines = shuffle(lines);
    scratchpad.value = lines.join("\n");
}

let base64encode = (textarea) => {
    textarea.value = btoa(textarea.value);
};

let base64decode = (textarea) => {
    textarea.value = atob(textarea.value);
}

let jq = (scratchpad) => {
    try {
        var formatted = JSON.stringify(JSON.parse(scratchpad.value), null, 2);
        scratchpad.value = formatted;
    } catch (e) {
        displayError(e.message);
    }
}

let jwt = (scratchpad) => {
    try {
        var token = jwt_decode(scratchpad.value);
        var decodedHeader = jwt_decode(scratchpad.value, { header: true });
        scratchpad.value = JSON.stringify(decodedHeader, null, 2) + "\n" + JSON.stringify(token, null, 2);
    } catch (e) {
        displayError(e.message);
    }
}

let uuid = (scratchpad) => {
    var uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );

    replaceSelection(scratchpad, uuid);
}

let dt = (scratchpad) => {
    replaceSelection(scratchpad, new Date().toISOString());
}

let passphrase = (scratchpad) => {
    replaceSelection(scratchpad, generatePassphrase());
}

let pw = (scratchpad) => {
    var passwordCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890%+-./:=@_"
    var result = "";
    while (result.length < 12) {
        result += passwordCharacters[Math.floor(Math.random() * passwordCharacters.length)];
    }
    replaceSelection(scratchpad, result);
}

let duospace = () => {
    let body = document.querySelector('body');
    body.classList.toggle('duospace');
    localStorage.setItem("duospace", body.classList.contains('duospace') ? '1' : '');
}

let download = (scratchpad) => {
    var link = "data:application/octet-stream;charset=utf-16le;base64," + btoa(scratchpad.value);
    var el = document.createElement('a');
    el.setAttribute("href", link);
    el.setAttribute("download", new Date().toISOString().replaceAll(":", "") + "-scratchpad.txt");
    el.innerText = "dl";
    el.style.display = "none";
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
}

let darkMode = () => {
    let body = document.querySelector('body');

    if (body.classList.contains('night')) {
        body.classList = 'day';
        localStorage.setItem("mode", "day");
    } else {
        body.classList = 'night';
        localStorage.setItem("mode", "night");
    }
}

let unindentCurrentLine = (scratchpad) => {
    let pos = scratchpad.selectionStart;
    let lines = scratchpad.value.split("\n");
    let current_line_number = getLineNumber(scratchpad);

    let line = lines[current_line_number];
    let line_length = line.length;

    // remove up to two spaces from the current line
    line = line[0] === " " ? line.substring(1) : line;
    line = line[0] === " " ? line.substring(1) : line
    let length_change = line_length - line.length;
    lines[current_line_number] = line;

    scratchpad.value = lines.join('\n');
    scratchpad.setSelectionRange(pos - length_change, pos - length_change)
}

let handleTab = (e, scratchpad) => {
    let pos = scratchpad.selectionStart;

    if (!e.shiftKey) {
        scratchpad.value = scratchpad.value.slice(0, pos) + "  " + scratchpad.value.slice(pos);
        scratchpad.setSelectionRange(pos + 2, pos + 2);
    } else {
        unindentCurrentLine(scratchpad);
    }
}

let handleKeyUp = (e, scratchpad) => {
    if (e.key === "Enter") {
        indentNewline(scratchpad);
        !e.shiftKey && continueListOnNewline(scratchpad);
    }
    saveToLocalStorage(scratchpad);
}

let handleKeyDown = (e, scratchpad) => {
    if (e.key === "Tab") {
        e.preventDefault();
        handleTab(e, scratchpad);
    }
}

let updateMarkdown = (scratchpad) => {
    let el = document.querySelector('#markdownOutput');
    let content = scratchpad.value;
    el.innerHTML = marked(content, {
        highlight: (code) => {
            return hljs.highlightAuto(code).value;
        }
    });
}

let toggleMarkdown = (scratchpad) => {
    let el = document.querySelector('#markdownOutput');

    if (!el) {
        openDismissablePanel('markdownOutput');
        updateMarkdown(scratchpad);
        scratchpad.onsave = updateMarkdown;
    } else {
        dismissDismissablePanels();
        scratchpad.onsave = null;
    }
}

let updateWriteGood = (scratchpad) => {
    let tempEl = document.createElement('div');
    tempEl.innerText = scratchpad.value;

    let html = tempEl.innerHTML;
    let results = writeGood(html);

    for (let r of results.reverse()) {
        console.log(r);
        html = html.substring(0, r.index) +
            "<span class='highlight' aria-label='" + r.reason + "' data-balloon-pos='down-left'>" +
            html.substring(r.index, r.index + r.offset) +
            "</span>" + html.substring(r.index + r.offset);
    }

    let el = document.querySelector('#writeGoodOutput');
    el.innerHTML = html;
}

let toggleWriteGood = (scratchpad) => {
    let el = document.querySelector('#writeGoodOutput');

    if (!el) {
        openDismissablePanel('writeGoodOutput')
        updateWriteGood(scratchpad);
        scratchpad.onsave = updateWriteGood;
    } else {
        dismissDismissablePanels();
        scratchpad.onsave = null;
    }
}

let toggleSidebar = (scratchpad) => {
    let sidebarEl = document.querySelector("#sidebar");
    sidebarEl.style.display = sidebarEl.style.display == 'block' ? 'none' : 'block';
}

let dismissDismissablePanels = () => {
    let els = document.getElementsByClassName('dismissable');

    for (let el of els) {
        el.parentNode.removeChild(el);
    }
};

let openDismissablePanel = (id) => {
    dismissDismissablePanels();

    let el = document.createElement('div');
    el.classList = 'dismissable';

    let closeEl = document.createElement('span');
    closeEl.innerHTML = 'x';
    closeEl.classList = 'close';
    closeEl.onclick = dismissDismissablePanels;
    el.appendChild(closeEl);

    let contentEl = document.createElement('div');
    contentEl.id = id;
    el.appendChild(contentEl);

    document.querySelector('main').appendChild(el);
};

(function() {
    let scratchpad = document.querySelector('#scratchpad');
    loadFromLocalStorage(scratchpad);

    scratchpad.onkeydown = (e) => handleKeyDown(e, scratchpad);
    scratchpad.onkeyup = (e) => handleKeyUp(e, scratchpad);

    // setup actions
    // other ideas:
    //  - kroki.io chart (with preview)
    //  - regex matches

    const tools = [
        {
            "name": "base64-decode",
            "action": base64decode,
        },
        {
            "name": "base64-encode",
            "action": base64encode,
        },
        {
            "name": "dark",
            "action": darkMode,
            "footer": true,
        },
        {
            "name": "dl",
            "action": download,
            "footer": true,
        },
        {
            "name": "dt",
            "action": dt,
            "footer": true,
        },
        {
            "name": "duospace (font)",
            "action": duospace,
        },
        {
            "name": "jq",
            "action": jq,
            "description": "Format the current scratchpad value as JSON",
            "footer": true,
        },
        {
            "name": "jwt",
            "action": jwt,
            "footer": true,
        },
        {
            "name": "md",
            "action": toggleMarkdown,
            "footer": true,
        },
        {
            "name": "passphrase",
            "action": passphrase,
            "description": "Generate a passphrase using the EFF short word list"
        },
        {
            "name": "pw",
            "action": pw,
            "description": "Generate a random 12 character password",
            "footer": true,
        },
        {
            "name": "shuffle",
            "action": shuffleLines,
            "description": "Sort all lines in the scratchpad alphabetically"
        },
        {
            "name": "sidebar",
            "action": toggleSidebar,
            "footer": true,
        },
        {
            "name": "sort",
            "action": sortLines,
            "description": "Sort all lines in the scratchpad alphabetically"
        },
        {
            "name": "uuid",
            "action": uuid,
            "footer": true,
        },
        {
            "name": "write-good",
            "action": toggleWriteGood,
        },
    ];

    let toolsEl = document.querySelector("#tools");
    let sidebarEl = document.querySelector("#sidebar");
    tools.forEach(tool => {
        if (tool.footer) {
            let a = document.createElement('a');
            a.innerText = "~" + tool.name + "   ";
            a.onclick = (e) => {
                e.preventDefault();
                tool.action(scratchpad);
                saveToLocalStorage(scratchpad);
            };
            a.href = "#";
            toolsEl.appendChild(a);
        }

        let a = document.createElement('a');
        a.innerText = "~" + tool.name;
        a.onclick = (e) => {
            e.preventDefault();
            tool.action(scratchpad);
            saveToLocalStorage(scratchpad);
        };
        a.href = "#";
        sidebarEl.appendChild(a);
    });

    toolsEl.appendChild(document.createElement("br"));
    toolsEl.appendChild(document.createTextNode("(sidebar: cmd+shift+k)"));

    scratchpad.focus();

    Mousetrap.bind('mod+shift+k', function(e) {
        toggleSidebar();
    });
})()
