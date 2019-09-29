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

let loadFromLocalStorage = (scratchpad) => {
    // ensure we keep the same night / day mode
    if (localStorage.getItem("mode") == "night") {
        document.getElementsByTagName('body')[0].classList = 'night';
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

let jq = (scratchpad) => {
    try {
        var formatted = JSON.stringify(JSON.parse(scratchpad.value), null, 2);
        scratchpad.value = formatted;
    } catch (e) {
        displayError(e.message);
    }
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

    console.l
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
    el.innerHTML = marked(content);
}

let toggleMarkdown = (scratchpad) => {
    let el = document.querySelector('#markdownOutput');

    if(!el) {

        el = document.createElement('div');
        el.id = "markdownOutput";
        el.style.width = "100%";
        el.style.padding = "2em";
        el.style.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        document.querySelector('main').appendChild(el);

        updateMarkdown(scratchpad);
        scratchpad.onsave = updateMarkdown;
    } else {
        el.parentNode.removeChild(el);
        scratchpad.onsave = null;
    }
}

let updateWriteGood = (scratchpad) => {
    let tempEl = document.createElement('div');
    tempEl.innerText = scratchpad.value;

    let html = tempEl.innerHTML;
    let results = writeGood(html);

    for (let r of results.reverse()) {
        html = html.substring(0, r.index) +
            "<span style='background-color: yellow; padding: 2px;'>" +
            html.substring(r.index, r.index + r.offset) +
            "</span>" + html.substring(r.index + r.offset);
    }

    let el = document.querySelector('#writeGoodOutput');
    el.innerHTML = html;
}

let toggleWriteGood = (scratchpad) => {
    let el = document.querySelector('#writeGoodOutput');

    if(!el) {
        el = document.createElement('div');
        el.id = "writeGoodOutput";
        el.style.width = "100%";
        el.style.padding = "2em";
        document.querySelector('main').appendChild(el);

        updateWriteGood(scratchpad);
        scratchpad.onsave = updateWriteGood;
    } else {
        el.parentNode.removeChild(el);
        scratchpad.onsave = null;
    }
}

(function() {
    let scratchpad = document.querySelector('#scratchpad');
    loadFromLocalStorage(scratchpad);

    scratchpad.onkeydown = (e) => handleKeyDown(e, scratchpad);
    scratchpad.onkeyup = (e) => handleKeyUp(e, scratchpad);

    // setup actions
    const tools = [
        {
            "name": "jq",
            "action": jq,
        },
        {
            "name": "dark",
            "action": darkMode,
        },
        {
            "name": "md",
            "action": toggleMarkdown,
        },
        {
            "name": "write-good",
            "action": toggleWriteGood,
        }
    ];

    tools.forEach(tool => {
        let toolsEl = document.querySelector("#tools");
        let a = document.createElement('a');
        a.innerText = "~" + tool.name + "   ";
        a.onclick = (e) => {
            e.preventDefault();
            tool.action(scratchpad);
            saveToLocalStorage(scratchpad);
        };
        a.href = "#";
        toolsEl.appendChild(a)
    });
})()
