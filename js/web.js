$(function(){
    var x = new game();
    x.setGameMode({
        'playercount' : 1,
        'computerTurn': 2,
        'difficulty': 'easy',

    });
    x.initialize($('.tictactoe'));
    x.initializeUI();
});
