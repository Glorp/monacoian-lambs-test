require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});
var editor;

require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('container'), {
        value: ['ctrl+l inserts λ\nctrl+d inserts ≜',
                'ctrl+enter does one step of evaluation or define/undefine',
                'ctrl+r rewrites stuff and replaces names defined elsewhere with their definitions',
                'ctrl+shift+enter does lots of evaluation',
                'right-click and Show definitions to list the available definitions\n',
                'e.g.',
                'put cursor on line below and ctrl+enter',
                '0 ≜ λf.λx.x\n',
                'put cursor on line below and ctrl+enter',
                'S ≜ λn.λf.λx.f (n f x)\n',
                'put cursor on line below and ctrl+enter',
                '2 ≜ S (S 0)\n',
                'put cursor on line below and ctrl+enter',
                'plus ≜ λa.λb.a S b\n',
                'put cursor on line below and ctrl+enter',
                '6 ≜ plus 2 (plus 2 2)\n',
                'put cursor on line below and ctrl+r, then ctrl+shift+enter',
                'plus 6 6\n\n'].join('\n'),
        quickSuggestions: false,
        mouseWheelZoom: true
    });

    var lamBinding = editor.addCommand([monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_L], function() {
        var range = editor.getSelection();
        var id = { major: 1, minor: 1 };
        var text = 'λ';
        var op = {identifier: id, range: range, text: text, forceMoveMarkers: true};
        editor.executeEdits("lambs", [op]);
    });

    var lamBinding = editor.addCommand([monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_D], function() {
        var range = editor.getSelection();
        var id = { major: 1, minor: 1 };
        var text = '≜';
        var op = {identifier: id, range: range, text: text, forceMoveMarkers: true};
        editor.executeEdits("lambs", [op]);
    });

    var evalBinding = editor.addCommand([monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter], function() {
        var selection = editor.getSelection();
        var line = selection.positionLineNumber;
        var model = editor.getModel();
        var s = model.getLineContent(line);
        var pos = new monaco.Position(line, s.length + 1);
        editor.setPosition(pos);
        var range = editor.getSelection();
        var id = { major: 1, minor: 1 };
        var parsed = lambs.parse(s);
        updateDefs(parsed);
        var text = '\n' + lambs.step(parsed);
        var op = {identifier: id, range: range, text: text, forceMoveMarkers: true};
        editor.pushUndoStop();
        editor.executeEdits("lambs", [op]);
        editor.pushUndoStop();
        editor.revealPosition(editor.getPosition());
    });

    var evalManyBinding = editor.addCommand([monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter], function() {
        var selection = editor.getSelection();
        var line = selection.positionLineNumber;
        var model = editor.getModel();
        var s = model.getLineContent(line);
        var pos = new monaco.Position(line, s.length + 1);
        editor.setPosition(pos);
        var range = editor.getSelection();
        var id = { major: 1, minor: 1 };
        var parsed = lambs.parse(s);

        var next = lambs.step1(parsed);
        var text = '\n' + lambs.execStr(next);

        var edits;
        if (lambs.isJust(next)) {
          edits = [];
        } else {
          edits [{identifier: id, range: range, text: text, forceMoveMarkers: true}];
        }

        var i = 0;
        while (lambs.isJust(next) && i < 1000) {
            text = '\n' + lambs.execStr(next);
            edits.push({identifier: null, range: range, text: text, forceMoveMarkers: true});
            next = lambs.stepn(next);
            i = i + 1;
        }
        editor.pushUndoStop();
        editor.executeEdits("lambs", edits);
        editor.pushUndoStop();
        editor.revealPosition(editor.getPosition());
    });

    var renameDefsBinding = editor.addCommand([monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_R], function() {
        var selection = editor.getSelection();
        var line = selection.positionLineNumber;
        var model = editor.getModel();
        var s = model.getLineContent(line);
        var pos = new monaco.Position(line, s.length + 1);
        editor.setPosition(pos);
        var range = editor.getSelection();
        var id = { major: 1, minor: 1 };
        var parsed = lambs.parse(s);
        var text = '\n' + lambs.renameDefs(defs)(parsed);
        var op = {identifier: id, range: range, text: text, forceMoveMarkers: true};
        editor.pushUndoStop();
        editor.executeEdits("lambs", [op]);
        editor.pushUndoStop();
        editor.revealPosition(editor.getPosition());
    });

    var defsAction = editor.addAction({
	     id: 'defs-action-id',
	     label: 'Show definitions',

	     keybindingContext: null,

	     contextMenuGroupId: 'navigation',

	     contextMenuOrder: 1.5,

	     run: function(ed) {
              var selection = ed.getSelection();
              var line = selection.positionLineNumber;
              var model = ed.getModel();
              var s = model.getLineContent(line);
              var pos = new monaco.Position(line, s.length + 1);
              ed.setPosition(pos);
              var range = ed.getSelection();
              var id = { major: 1, minor: 1 };
              var parsed = lambs.parse(s);
              var text = '\n' + lambs.defsString(defs);
              var op = {identifier: id, range: range, text: text, forceMoveMarkers: true};
              ed.pushUndoStop();
              ed.executeEdits("lambs", [op]);
              ed.pushUndoStop();
              ed.revealPosition(ed.getPosition());
	         }});
});
