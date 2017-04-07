$(function(){
    function getValue(forindex) {
        var osvg = '<svg display="block" viewBox="0 0 200 200" class="circlesvg"><circle class="circle-1" cx="100" cy="100" r="50" stroke="#666" stroke-width="14" fill="transparent" /></svg>';
        var xsvg =  '<svg display="block" viewBox="0 0 200 200"><path class="cross1" d="M 45,50 L 150,150" stroke="#666" stroke-width="15" />'
        + '<path class="cross2" d="M 150,50 L 50,150" stroke="#666" stroke-width="15" /></svg>'
        return (forindex == 0) ? '' : (forindex == 1) ? xsvg : osvg;
    }



    function victoryCondition(board) {
        var boardFull = true;
        var victoryCheck = 0;

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
                        victoryCheck = lastValueRowCheck;
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
                        victoryCheck = lastValueColCheck;
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
                    victoryCheck = lastValueDiagCheck;
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
                    victoryCheck = lastValueDiagCheck2;
                    break;
                }
            } else {
                var lastValueDiagCheck2 = 0;
                var DiagCheckMatch2 = new Array();
            }

        }
        return victoryCheck;

    }

    function game() {

        this.container = null;
        this.move = 1;
        this.player = 1;
        this.noofplayers = 1;
        this.gamestate = [[0,0,0],[0,0,0],[0,0,0]];
        this.baseState = [[0,0,0],[0,0,0],[0,0,0]];
        this.cache = {};
        var _game = this;
        this.computerPlayer = 1;
        this.active = false;

        this.playMove = function(dataObject) {

            if("row" in dataObject && "cell" in dataObject && "move" in dataObject) {

                var cellSelector = 'td.cell-' + dataObject.row + '-' + dataObject.cell;
                var cellElement = $(cellSelector);
                cellElement.html(getValue(dataObject.move));
                cellElement.data("value", dataObject.move);
                _game.gamestate[dataObject.row][dataObject.cell] = _game.move;
                var v = victoryCondition(_game.gamestate);
                //console.log(v);
                if(v > 0) {
                    _game.finish();

                } else {
                    _game.nextMove();


                }
            }
        }


        /* End Game */
        this.finish = function() {
            if(_game.noofplayers == 2) {
                $('.victory').text("Player "+_game.player + " Wins with "+getValue(_game.move));
                $('.victory').show();
            }
            else {
                if(_game.player == 1) {
                    $('.victory').text("You Win with "+getValue(_game.move));
                    $('.victory').show();
                } else {
                    $('.victory').text("Computer Wins with "+getValue(_game.move));
                    $('.victory').show();
                }
            }
            _game.active = false;
        }



        this.nextMove = function() {
            //Change Turn
            _game.move = (_game.move == 1) ? 2 : 1;
            _game.player = (_game.player == 1) ? 2 : 1;
            //Wait for Player Move or Play Computer Move
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
                        if(victoryCondition(newboard) == move) {
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
            var table = element.find('table tbody');
            table.html(' ');
            _game.container = element;
            _game.move = 1;
            _game.player = 1;
            _game.gamestate = arrayClone(_game.baseState);
            _game.gamestate.forEach(function(row,index) {
                var rowElement = $('<tr>');
                row.forEach(function(value, cellindex){
                    var cellClass = 'cell-' + index + '-' + cellindex;
                    var cellElement = $('<td>' + getValue(value) + '</td>');
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

            if(_game.computerPlayer == 1 && _game.noofplayers == 1) {
                _game.computerMove();
            }
        }

        this.setGameMode = function(gamesettings) {
            _game.player = 1;
            _game.noofplayers = ('playercount' in gamesettings) ? gamesettings.playercount : 1;
            if(_game.noofplayers == 1) {
                _game.computerPlayer = ('computerTurn' in gamesettings) ? gamesettings.computerTurn : 2;
            }
        }

        this.computerMove = function() {
            if(_game.noofplayers == 1 && _game.player == _game.computerPlayer) {
                var ai = _game.enemyAI({'gamestate': _game.gamestate});
                _game.playMove({"row": ai.row, "cell": ai.cell, "move": _game .move});
            }
        }

        this.initializeUI = function() {
            _game.container.find('.reset').click(function(){

                _game.reset();
            })
            _game.container.find('.player1').click(function(){
                _game.setGameMode({playercount:1, computerTurn:2});
                _game.container.removeClass('player-2');
                _game.container.addClass('player-1');
                _game.reset();
            })
            _game.container.find('.player2').click(function(){
                _game.setGameMode({playercount:1, computerTurn:1});
                _game.container.removeClass('player-1');
                _game.container.addClass('player-2');
                _game.reset();
            })
            _game.container.find('.player').click(function(){
                if(_game.container.hasClass('players-2')) {
                    _game.setGameMode({playercount:1  });
                    _game.container.removeClass('players-2');
                    _game.container.addClass('players-1');
                } else {
                    _game.setGameMode({playercount:2});
                    _game.container.removeClass('players-1');
                    _game.container.addClass('players-2');

                }


                _game.reset();
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
    var x = new game();
    x.setGameMode({
        'playercount' : 1,
        'computerTurn': 2
    });
    x.initialize($('.tictactoe'));
    x.initializeUI();

});
