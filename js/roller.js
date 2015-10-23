var Roller = (function(){
    var error = 'Check Input',
        saved = localStorage.savedRolls ? JSON.parse(localStorage.savedRolls): {},
        lib = {},
        me = {
            init:function(where){
                loadStyles('css/roller.css');
                loadScript('http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js',function(where){
                    loadUtils(where);
                });
            },
            _private:{error:error,saved:saved,lib:lib}
        };
    function loadStyles(url){
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(link, entry);
    }
    function loadScript(url, callback){
        var script = document.createElement('script');
        script.async = true;
        script.src = url;
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
        script.onload = script.onreadystatechange = function()
        {
            var rdyState = script.readyState;
            if (!rdyState || /complete|loaded/.test(script.readyState))
            {
                callback();
                script.onload = null;
                script.onreadystatechange = null;
            }
        };
    }
    function loadConstructs(where) {
        loadScript('js/roll_constructs.js', function () {
            lib.buildGUI(where);
            console.log(lib);
        });        
    }
    function loadUtils(where) {
        loadScript('js/roll_utils.js', function(){
            loadDomUtils(where);
        });
    }
    function loadDomUtils(where) {
        loadScript('js/roll_DOMutils.js', function(){
            loadConstructs(where);
        });
    }

    return me;
})();
