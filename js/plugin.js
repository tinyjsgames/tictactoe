$(function(){
    var x = new game();
    x.persistence = true;
    x.setGameMode({
        'playercount' : 1,
        'computerTurn': 2,
        'difficulty': 'easy',

    });
    //localStorage.removeItem("tictactoe");
    if (typeof(Storage) !== "undefined") {

        var localdata = localStorage.getItem('tictactoe');
        if(localdata!==null) {
            savedstate = JSON.parse(localdata);
            x.savedState = savedstate;
            x.difficulty = savedstate.difficulty;
            x.setGameMode(savedstate.settings);

        }
    }
    x.initialize($('.tictactoe'));
    if(typeof(savedstate)!=='undefined') {
        x.initializeUI(savedstate.settings);
    } else {
        x.initializeUI();
    }
});
