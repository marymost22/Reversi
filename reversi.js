var game = {
	score : null,
	rows : 10,
	cols : 10,
	grid: [],
	states: {
		'black': {'id': false, 'color': '#757575'},
		'white': {'id': true, 'color': '#FF5722'},
		'nothing': {'id': -1, 'color': '#FFFFFF'}
	}
};

var turn = false;


function initGame(){
	var itemRow= game.rows/2 -1,
		itemCol= game.cols/2 -1;

	grid();	

	setItemState(itemRow,itemCol,false);
	setItemState(itemRow,itemCol+1,true);
	setItemState(itemRow+1,itemCol,true);
	setItemState(itemRow+1,itemCol+1,false);
	initScoreBar();
}

function initScoreBar(){

    scoreBlack = document.createElement('span'),
    scoreWhite = document.createElement('span');
        
    scoreBlack.className = 'score scoreBlack';
    scoreWhite.className = 'score scoreWhite';
    
    document.body.appendChild(scoreBlack);
    document.body.appendChild(scoreWhite);
    
    game.score = {
        'black': { 
            'elem': scoreBlack,
            'state': 0
        },
        'white': { 
            'elem': scoreWhite,
            'state': 0
        },
    }
 	calculateScore();
 	setTurn(turn);
}
    
function initItemState(elem) {
        
    return {
        'state': game.states.nothing,
        'elem': elem
    };
}

function setTurn(turn){
	if(turn=== game.states.black.id){
		document.getElementById('turn').style.background = game.states.black.color;
	}
	else {
		document.getElementById('turn').style.background = game.states.white.color;	
	}
}

function setItemState(row,col,state){
	grid[row][col].state = state;
	grid[row][col].elem.style.visibility = isVisibleItem(row,col) ? 'visible' : 'visible';

	grid[row][col].elem.style.background = (state === game.states.black.id) ? game.states.black.color : game.states.white.color;	
}

function grid(){
	var newdiv, divIdName;
	for (var i=0; i<game.rows; i++){
		grid[i]=[];
		for(var j=0; j<game.cols; j++){
     		newdiv=document.createElement('div');
         	divIdName=i.toString() + j.toString();
         	newdiv.id = divIdName;
         	newdiv.setAttribute('row',i);
         	newdiv.setAttribute('col',j);
         	newdiv.style.top=50+50*i+'px';
         	newdiv.style.left=50+50*j+'px';
         	newdiv.addEventListener("click",  function(){ gameAction(this);});

         	document.body.appendChild(newdiv);
         	grid[i][j]=initItemState(newdiv.appendChild(document.createElement('span')));
		}
	}        
}

function gameAction(x){

	var value = x.getAttribute('value');
	var col = Number(x.getAttribute('col'));
	var row = Number(x.getAttribute('row'));
	//If the player has possible movements and the specific movement is valid
	if(possibleMovement() && isValidMove(row,col)){ 
		setItemState(row,col, turn);
		checkChanges(row,col);
		turn = !turn; //Change turn
		setTurn(turn);

		//If the other player hasn't possible movements, it's my turn again
		if(!possibleMovement()){
			turn=!turn;
			setTurn(turn);
			
			if(!possibleMovement()){	//But if a don't have possible movements neither, the game is over
				endGame();
			}
		}

		if(checkEnd()){ //If the table is full
			endGame();
		}
	}	
}

function checkChanges(row,col){
	var toCheck = (turn === game.states.black.id) ? game.states.white.id : game.states.black.id;
	var currentRow, currentCol;
	var finalItems = [];

	// We have to check the 8 possible directions
	/* 
		-1-1	-10		-11
		 0-1	 00		 01
		 1-1	 10		 11
	*/

	for (var directionRow = -1; directionRow<=1; directionRow++) {
		for(var directionCol = -1; directionCol<=1; directionCol++){
			var possibleItems = [];

			if(directionCol == 0 && directionRow == 0){
				continue;
			}

			currentRow = row + directionRow;
			currentCol = col + directionCol;
			
			//Check all the possible tokens in a specific direction
			while(isValidPosition(currentRow,currentCol) && isVisibleItem(currentRow,currentCol) && !isMine(currentRow,currentCol)){
				possibleItems.push([currentRow,currentCol]);
				currentRow+=directionRow;
				currentCol+=directionCol;

			}

			if(possibleItems.length){
				//Bearing in mind that the value of currentRow and currentCol has increased
				if(isValidPosition(currentRow,currentCol) && isVisibleItem(currentRow,currentCol) && isMine(currentRow,currentCol)){
					finalItems.push[currentRow, currentCol];
					for(var item in possibleItems)
						finalItems.push(possibleItems[item]);
				}
			}
		}
	}

	//Once we've checked all the directions
	if(finalItems.length){
		for(var item in finalItems){
			setItemState(finalItems[item][0], finalItems[item][1],turn);
			calculateScore();
		}
	}
}

function possibleMovement(){ //TODO Mejorar esto:
	for(var i = 0; i<game.rows; i++){
		for(var j = 0; j<game.cols; j++){
			if(isValidMove(i,j))
				return true;
		}
	}
	return false;
}

function isValidPosition(row, col){
	return(row>=0 && row<game.rows && 
			col>=0 && col<game.cols);
}

function isValidMove(row,col){
	var toCheck = (turn === game.states.black.id) ? game.states.white.id : game.states.black.id;
	var currentRow, currentCol;
	
	if(! isValidPosition(row,col) || isVisibleItem(row,col)){
		return false;
	}

	// We have to check the 8 possible directions
	/* 
		-1-1	-10		-11
		 0-1	 00		 01
		 1-1	 10		 11
	*/

	for (var directionRow = -1; directionRow<=1; directionRow++) {
		for(var directionCol = -1; directionCol<=1; directionCol++){
			if(directionCol == 0 && directionRow == 0){
				continue;
			}
			
			currentRow = row + directionRow;
			currentCol = col + directionCol;
			
			var potentialItem = false;

			//Check all the possible tokens in a specific direction
			while(isValidPosition(currentRow,currentCol) && isVisibleItem(currentRow,currentCol) && !isMine(currentRow,currentCol)){
				potentialItem=true; //We found a potential item
				currentRow+=directionRow;
				currentCol+=directionCol;

			}


			if(potentialItem){
				//Bearing in mind that the value of currentRow and currentCol has increased, we have to check if this item is one of ours, in that case, we have a possible move.
				if(isValidPosition(currentRow,currentCol) && isVisibleItem(currentRow,currentCol) && isMine(currentRow,currentCol)){
					return true;
				}
			}
		}
	}
	//Any item had been found, we don't have possible moves. 
	return false;
}

function isVisibleItem(row,col){
	var state = grid[row][col].state;
	var valor = ( state === game.states.white.id || state === game.states.black.id);
	return valor;
}

function isMine(row,col){
	
	return (turn === grid[row][col].state);
}

function calculateScore(){
	var black = 0, white = 0;
	for(var i = 0; i<game.rows; i++){
		for(var j = 0; j<game.cols; j++){
			if(isValidPosition(i,j) && isVisibleItem(i,j)){
				if(grid[i][j].state === game.states.black.id){
					black++;
				}
				else{
					white++;
				}
			}
		}
	}
	game.score.black.state=black;
	game.score.white.state=white;
	game.score.black.elem.innerHTML = '&nbsp;' + black + '&nbsp;';
    game.score.white.elem.innerHTML = '&nbsp;' + white + '&nbsp;';
}

//Returns TRUE if is the end of the game
function checkEnd(){ 

    for (var i = 0; i < game.rows; i++) {
        for (var j = 0; j < game.cols; j++) {
            if (isValidPosition(i,j) && !isVisibleItem(i,j)) {
                return false;
    		}
		}
	}
	console.log("Fin del juego");

		return true;
}

function endGame(){
	var message,winner = game.states.nothing.id ;

	message = document.createElement('div');
	message.className = 'message';
	

	winner = (game.score.black.state>game.score.white.state) ? game.states.black.id : game.states.white.id;  

	console.log(winner);

	switch(winner){
		case game.states.black.id:
			message.innerHTML='&nbsp Player 1 WINNER &nbsp;';
			message.style.color = game.states.black.color;
		break;
		case game.states.white.id:
			message.innerHTML='&nbsp Player 2 WINNER &nbsp;';
			message.style.color = game.states.white.color;
		break;
		default:
			message.innerHTML='&nbsp Match equals &nbsp;'
		break;  
	}

	document.body.appendChild(message);
}

function restart(){
	//TODO
}

