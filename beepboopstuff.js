require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});
var editor;

require(['vs/editor/editor.main'], function() {

    monaco.languages.register({ id: 'lambs' });

    editor = monaco.editor.create(document.getElementById('container'), {
        value: [
          'cursor on line with beeps and boops, press ctrl+enter\n\n',
          'S:\nbeep beep beep pling boop boop bap pling pling boop boop boop bap boop boop bap boop bap\n',
          '+:\nbeep beep pling pling boop bap beep beep beep pling boop boop bap pling pling boop boop boop bap boop boop bap boop bap boop boop bap\n',
          '0:\nbeep beep boop bap\n',
          '1:\nbeep beep pling boop boop bap boop bap\n',
          '2:\nbeep beep pling boop boop bap pling boop boop bap boop bap\n',
          '2 + 2:\npling pling beep beep pling pling boop bap beep beep beep pling boop boop bap pling pling boop boop boop bap boop boop bap boop bap boop boop bap beep beep pling boop boop bap pling boop boop bap boop bap beep beep pling boop boop bap pling boop boop bap boop bap\n'].join('\n'),
        language: 'lambs',
        quickSuggestions: false,
        mouseWheelZoom: true
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
        var text;
        if (lambs.isJust(parsed)) {
          var next = lambs.step(parsed);
          if (lambs.isJust(next)) {
            text = lambs.unparse(next);
          } else {
            text = lambs.unparse(parsed);
          }
        } else {
          text = ":("
        }

        var op = {identifier: id, range: range, text: "\n" + text, forceMoveMarkers: true};
        editor.pushUndoStop();
        editor.executeEdits("lambs", [op]);
        editor.pushUndoStop();
        editor.revealPosition(editor.getPosition());
    });

});
