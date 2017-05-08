var Helpers = {
    Random : function(min,max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
var VictorySVG = {
    row0: "M 0,100 L 600,100",
    diag1:"M 45,40 L 550,560",
    diag2:"M 550,47 L 45,565",
    row1:"M 0,305 L 600,305",
    row2:"M 0,510 L 600,510",
    col0:"M 100,0 L 100,600",
    col1:"M 300,0 L 300,600",
    col2:"M 500,0 L 500,600",
    generate : function(index,color) {
        return '<svg display="block" viewBox="0 0 600 600">'
        +'<path class="line1 animate" d="'
        +VictorySVG[index]
        +'" stroke="'
        + color
        +'"stroke-width="10" />'
        +'</svg>';
    }

}

function getValue(forindex, pathclass="animate") {
    var osvg = '<svg display="block" viewBox="0 0 200 200" class="circlesvg ' + pathclass + '"><circle class="circle-1 ' + pathclass + '" cx="100" cy="100" r="50" stroke="#666" stroke-width="14" fill="transparent" /></svg>';
    var xsvg =  '<svg display="block" viewBox="0 0 200 200"><path class="cross1 ' + pathclass + '" d="M 50,50 L 150,150" stroke="#666" stroke-width="15" />'
    + '<path class="cross2 ' + pathclass + '" d="M 150,50 L 50,150" stroke="#666" stroke-width="15" /></svg>'
    return (forindex == 0) ? '' : (forindex == 1) ? xsvg : osvg;
}





function game() {

    this.container = null;
    this.persistence = false;
    this.move = 1;
    this.player = 1;
    this.noofplayers = 1;
    this.gamestate = [[0,0,0],[0,0,0],[0,0,0]];
    this.baseState = [[0,0,0],[0,0,0],[0,0,0]];
    this.cache = {};
    var _game = this;
    this.computerPlayer = 1;
    this.active = false;
    this.turns = 0;
    this.difficulty = 'easy';

    this.playMove = function(dataObject) {

        if("row" in dataObject && "cell" in dataObject && "move" in dataObject) {

            var cellSelector = 'td.cell-' + dataObject.row + '-' + dataObject.cell;
            var cellElement = $(cellSelector);
            cellElement.html(getValue(dataObject.move));
            cellElement.data("value", dataObject.move);
            _game.gamestate[dataObject.row][dataObject.cell] = _game.move;
            var v = _game.victoryCondition(_game.gamestate);

            if(v.value > 0) {
                _game.finish(v);

            } else {
                _game.nextMove();


            }
        }
    }






    this.nextMove = function() {
        _game.turns++;
        //Change Turn
        _game.move = (_game.move == 1) ? 2 : 1;
        _game.player = (_game.player == 1) ? 2 : 1;
        //Wait for Player Move or Play Computer Move
        _game.turnInfo();
        if(_game.persistence) {
            _game.saveGameState();
        }
        if(_game.noofplayers == 1 && _game.player == _game.computerPlayer) {
            var timer = setTimeout(function(){_game.computerMove()},1500);
        }


    }
    this.enemyAI =   function enemyAI(gamedata={}) {
        var board = gamedata.gamestate;
        var move = ('move' in gamedata) ? gamedata.move : _game.move;
        var stack = _game.cache;
        var depth = ('depth' in gamedata) ? gamedata.depth : 1;
        var nextmove = (move == 1) ? 2 : 1;
        //Convert game state to string to save AI calculations in cache
        var newboardstring = JSON.stringify(board);
        //result object
        var result = {
            row:null,
            cell:null,
            baseScore:undefined,
            boardScore:0,
            win:0
        }
        /* Random move in easy difficulty */
        if(_game.turns <= 2 && _game.difficulty == 'easy') {


            var emptyrows = new Array();
            board.forEach(function(row,index){
                row.forEach(function(value,cellIndex){
                    if(value == 0) {
                        emptyrows.push({row:index,cell:cellIndex});
                    }
                });
            });
            var randomindex = Helpers.Random(0,emptyrows.length-1);
            return emptyrows[randomindex];

        }

        if(newboardstring in stack) {
            return stack[newboardstring];
        }
        /* Loop through all possible moves to choose best one */

        board.forEach(function(row,index){
            row.forEach(function(value,cellIndex){
                if(value==0) {
                    var moveScore = 0;
                    var newboard = JSON.parse(JSON.stringify(board));
                    newboard[index][cellIndex] = move;
                    var moveScore = 0;
                    if(_game.victoryCondition(newboard).value == move) {
                        moveScore = 100000;
                        result.baseScore = moveScore;
                        result.row = index;
                        result.cell = cellIndex;
                        result.win += 1;
                    } else {
                        var newresult = enemyAI({'gamestate': newboard,
                            'move': nextmove,
                            'depth': depth++
                        });
                        if(depth == 1) {
                            if(newresult.win >= 1) {
                                moveScore += -(newresult.boardScore);
                            }
                        }
                        if(depth > 1) {
                            moveScore += -(newresult.boardScore)/100;
                            if(newresult.win >=2) {
                                moveScore += -(newresult.boardScore)/10;
                            }
                        }

                        if(isNaN(result.baseScore) || (result.baseScore < moveScore) ) {
                            result.baseScore = moveScore;
                            result.row = index;
                            result.cell = cellIndex;
                        }
                    }
                    result.boardScore += moveScore;
                }
            })
        })

        stack[newboardstring] = result;
        return result;
    }



    this.initialize = function(element) {
        $('.line').hide();
        var table = element.find('table tbody');
        table.html(' ');
        _game.container = element;

        _game.move = _game.savedState ? _game.savedState.move : 1;
        _game.turns = _game.savedState ? _game.savedState.turns :0;
        _game.player = _game.savedState ? _game.savedState.player :1;
        _game.computerPlayer = _game.savedState ? _game.savedState.computerPlayer :2;

        _game.gamestate = _game.savedState ? arrayClone(_game.savedState.gamestate) : arrayClone(_game.baseState);
        _game.savedState = undefined;
        _game.gamestate.forEach(function(row,index) {
            var rowElement = $('<tr>');
            row.forEach(function(value, cellindex){
                var cellClass = 'cell-' + index + '-' + cellindex;
                var cellElement = $('<td>' + getValue(value,'noanimate') + '</td>');
                cellElement.addClass(cellClass);
                cellElement.data("row",index);
                cellElement.data("cell", cellindex);
                cellElement.data("value", value);
                rowElement.append(cellElement);
            });
            table.append(rowElement);
        });

        table.find('td').click(function(){
            if(_game.active) {
                var rowIndex = parseInt($(this).data("row"));
                var cellIndex = parseInt($(this).data("cell"));
                var curValue = parseInt($(this).data("value"));
                if(_game.gamestate[rowIndex][cellIndex] == 0 ) {
                    _game.playMove({"row": rowIndex, "cell": cellIndex, "move": _game .move});
                } else {
                    return;
                }
            }
        })
        _game.active = true;
        _game.turnInfo();
        if(_game.computerPlayer == 1 && _game.noofplayers == 1) {
            _game.computerMove();
        }
    }

    this.setGameMode = function(gamesettings) {
        _game.player = 1;
        _game.noofplayers = ('playercount' in gamesettings) ? gamesettings.playercount : 1;
        _game.difficulty = ('difficulty' in gamesettings) ? gamesettings.difficulty : 'easy';
        if(_game.noofplayers == 1) {
            _game.computerPlayer = ('computerTurn' in gamesettings) ? gamesettings.computerTurn : 2;
        } else {
            _game.computerPlayer = ('computerTurn' in gamesettings) ? gamesettings.computerTurn : 2;
        }
    }
    this.saveGameState = function() {
        var gameState = {
            gamestate: _game.gamestate,
            player: _game.player,
            move: _game.move,
            turns: _game.turns,
            computerPlayer: _game.computerPlayer,
            settings: {
                playercount: _game.noofplayers,
                computerTurn: _game.computerPlayer,
                difficulty: _game.difficulty
            }
        };
        if (typeof(Storage) !== "undefined") {
             localStorage.setItem('tictactoe',JSON.stringify(gameState));
        }

    }
    this.computerMove = function() {
        if(_game.noofplayers == 1 && _game.player == _game.computerPlayer) {
            var ai = _game.enemyAI({'gamestate': _game.gamestate});
            _game.playMove({"row": ai.row, "cell": ai.cell, "move": _game .move});
        }
    }
    this.turnInfo = function() {
        $('.turn-info-block').show();
        $('.victory-info').hide();
        var p1 = $('.turn-info .p1');
        var p2 = $('.turn-info .p2');

        if(_game.noofplayers == 1 && _game.computerPlayer == 2) {
            p1.html('X (Player 1) ');
            p2.html('O (Computer) ');

        } else if(_game.noofplayers == 1 && _game.computerPlayer == 1) {
            p1.html('X (Computer) ');
            p2.html('O (Player 1) ');
        }
        else if(_game.noofplayers == 2) {
            p1.html('X (Player 1) ');
            p2.html('O (Player 2) ');
        }
        p1.removeClass('selected');
        p2.removeClass('selected');
        if(_game.player == 1) {
            p1.addClass('selected');
        } else {
            p2.addClass('selected');
        }
    }
    this.victoryCondition = function victoryCondition(board) {
        var boardFull = true;
        var victoryCheck = {value:0};

        var lastValueDiagCheck =0 ;
        var DiagCheckMatch = new Array();
        var lastValueDiagCheck2 =0 ;
        var DiagCheckMatch2 = new Array();
        for (var i=0; i<board.length; i++) {
            var lastValueRowCheck = 0;
            var RowCheckMatch = new Array();
            var lastValueColCheck = 0;
            var ColCheckMatch = new Array();
            for (var j=0; j< board.length; j++) {

                if((board[i][j] > 0 ) && (board[i][j] == lastValueRowCheck || lastValueRowCheck == 0)) {

                    RowCheckMatch.push({row:i, cell:j});
                    lastValueRowCheck = board[i][j];
                    if(RowCheckMatch.length > 2) {
                        victoryCheck = {value:lastValueRowCheck, type:'row'+i};
                        break;
                    }
                } else {
                    var lastValueRowCheck = 0;
                    var RowCheckMatch = new Array();
                }
                if((board[j][i] > 0 ) && (board[j][i] == lastValueColCheck || lastValueColCheck == 0)) {
                    ColCheckMatch.push({row: j,cell: i});
                    lastValueColCheck = board[j][i];
                    if(ColCheckMatch.length > 2) {
                        victoryCheck = {value:lastValueColCheck, type:'col'+i};
                        break;
                    }
                } else {
                    var lastValueColCheck = 0;
                    var ColCheckMatch = new Array();
                }
            }

            if((board[i][i] > 0 ) && (board[i][i] == lastValueDiagCheck || lastValueDiagCheck == 0)) {
                DiagCheckMatch.push({row: j,cell: i});
                lastValueDiagCheck = board[i][i];
                if(DiagCheckMatch.length > 2) {
                    victoryCheck = {value:lastValueDiagCheck, type:'diag1'};
                    break;
                }
            } else {
                var lastValueDiagCheck = 0;
                var DiagCheckMatch = new Array();
            }
            var k = board.length - i-1;
            if((board[i][k] > 0 ) && (board[i][k] == lastValueDiagCheck2 || lastValueDiagCheck2 == 0)) {
                DiagCheckMatch2.push({row: i,cell: k});
                lastValueDiagCheck2 = board[i][k];
                if(DiagCheckMatch2.length > 2) {
                    victoryCheck = {value:lastValueDiagCheck2, type:'diag2'};
                    break;
                }
            } else {
                var lastValueDiagCheck2 = 0;
                var DiagCheckMatch2 = new Array();
            }

        }

        return victoryCheck;

    }
    /* End Game */
    this.finish = function(victory={value:0}) {

        $('.turn-info-block').hide();
        $('.victory-info').show();
        var infotext = $('.victory-info span');
        var color= '#666';
        if(_game.noofplayers == 2) {
            infotext.html('<i class="fa fa-thumbs-up" aria-hidden="true"></i> Player '+_game.player + ' Wins');
            infotext.addClass('green');
            infotext.removeClass('red');
            color = '#4CAF50';

        }
        else {

            if(_game.player != _game.computerPlayer) {
                infotext.html('<i class="fa fa-thumbs-up" aria-hidden="true"></i> You Win');
                infotext.addClass('green');
                color = '#4CAF50';
                infotext.removeClass('red');
            } else {
                infotext.html('<i class="fa fa-thumbs-down" aria-hidden="true"></i> Computer Wins');
                infotext.addClass('red');
                color ='#FE6262';
                infotext.removeClass('green');
            }
        }
        if('type' in victory) {
            var svgbody = VictorySVG.generate(victory.type,color);
            $('.line').show();
            $('.line').html(svgbody);
            console.log(svgbody);
        }

        _game.active = false;
    }
    this.initializeUI = function(savedsettings = null) {

        $('.settings-info').hide();


        var newSettings = savedsettings ? savedsettings : {playercount:1, computerTurn:2, difficulty:'easy'};

        _game.container.find('.reset').click(function(){
            _game.setGameMode(newSettings);
            _game.reset();
            settingsCheck();
        })

        function settingsCheck() {
            if(_game.noofplayers == newSettings.playercount
                && _game.computerPlayer == newSettings.computerTurn
                && _game.difficulty == newSettings.difficulty) {

                $('.settings-info').hide();
            } else {
                if(_game.turns <=1 ) {
                    _game.setGameMode(newSettings);
                    _game.reset();
                    settingsCheck();
                } else {
                    $('.settings-info').show();
                }

            }

        }
        var computercheckbox = $('input.computer');

        if(newSettings.playercount == 2) {
            computercheckbox.removeAttr('checked');
            _game.container.find('.computer-only').addClass('inactive');
            _game.container.find('.computer-only').find('input,select').attr('disabled','');
        }
        computercheckbox.change(function(){

            if($(this).prop('checked')==true) {
                newSettings.playercount=1;
                _game.container.find('.computer-only').removeClass('inactive');
                _game.container.find('.computer-only').find('input,select').removeAttr('disabled');
            } else {
                newSettings.playercount=2;
                _game.container.find('.computer-only').addClass('inactive');
                _game.container.find('.computer-only').find('input,select').attr('disabled','');
            }
            settingsCheck();
        });

        var turncheckbox = $('input.turn');

        if(newSettings.computerTurn == 1) {
            turncheckbox.removeAttr('checked');
        }

        turncheckbox.change(function(){

            if($(this).prop('checked')==true) {
                newSettings.computerTurn = 2;
            } else {
                newSettings.computerTurn = 1;
            }
            settingsCheck();
        });


        var difficultyselect = $('select.difficulty');
        difficultyselect.change(function(){
            if($(this).val()=='difficult') {
                newSettings.difficulty = 'difficult';
            } else {
                newSettings.difficulty = 'easy';
            }
            settingsCheck();
        });

        $('.custom-checkbox').each(function(){
            var checkbox = $(this).find('input[type="checkbox"]');
                if(checkbox.prop('checked')==false) {
                    $(this).addClass('inactive');
                    $(this).removeClass('active');
                } else {
                    $(this).addClass('active');
                    $(this).removeClass('inactive');

                }
        });
        $('.custom-checkbox').click(function(){
            var checkbox = $(this).find('input[type="checkbox"]');
                if(checkbox.prop('checked')==true) {
                    checkbox.attr('checked',false);
                    $(this).addClass('inactive');
                    $(this).removeClass('active');
                    checkbox.trigger("change");
                } else {
                    checkbox.attr('checked',true);
                    $(this).addClass('active');
                    $(this).removeClass('inactive');
                    checkbox.trigger("change");
                }

        })


    }


    this.reset = function() {
        var table = _game.container.find('table tbody');
        table.html(' ');
        this.initialize(_game.container);

    }

}

function arrayClone(arr) {
    if(Array.isArray(arr)) {
        arr = arr.slice(0);
        for(var i =0; i <arr.length; i++ ) {
            arr[i] = arrayClone(arr[i]);
        }
    }
    return arr;
}
