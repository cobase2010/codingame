/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

function Queue() {
    this._oldestIndex = 1;
    this._newestIndex = 1;
    this._storage = {};
}
 
Queue.prototype.size = function() {
    return this._newestIndex - this._oldestIndex;
};
 
Queue.prototype.enqueue = function(data) {
    this._storage[this._newestIndex] = data;
    this._newestIndex++;
};
 
Queue.prototype.dequeue = function() {
    var oldestIndex = this._oldestIndex,
        newestIndex = this._newestIndex,
        deletedData;
 
    if (oldestIndex !== newestIndex) {
        deletedData = this._storage[oldestIndex];
        delete this._storage[oldestIndex];
        this._oldestIndex++;
 
        return deletedData;
    }
};

function ComputeCard(card) {
    //Drop last char
    var card2 = card.slice(0, -1);
    if (card2 == 'J') {
        return 11;
    } else if (card2 == 'Q') {
        return 12;
    } else if (card2 == 'K') {
        return 13;
    } else if (card2 == 'A') {
        return 14;
    } else return parseInt(card2);
}

var n = parseInt(readline()); // the number of cards for player 1
var deck1 = new Queue();
for (var i = 0; i < n; i++) {
    var cardp1 = readline(); // the n cards of player 1
    //printErr(cardp1 + ' ');
    deck1.enqueue(cardp1);
}
printErr('\n');
var m = parseInt(readline()); // the number of cards for player 2
var deck2 = new Queue();
for (var i = 0; i < m; i++) {
    var cardp2 = readline(); // the m cards of player 2
    //printErr(cardp2 + ' ');
    deck2.enqueue(cardp2);
}
printErr('\n');

// Write an action using print()
// To debug: printErr('Debug messages...');
var pat = false;
var player = '';
var n = 0;
var war1 = new Queue();
var war2 = new Queue();

while (true) {

    
    if (deck1.size() === 0 && deck2.size() > 0) { //player2 wins
        player = '2';
        break;
    } else if (deck1.size() > 0 && deck2.size() ===0) {//player1 wins
        player = '1';
        break;
    } else if (deck1.size() === 0 && deck2.size() === 0) { //equal
        pat = true;
        break;
    } else { //both deck has cards
       
        var card1 = deck1.dequeue();
        var card2 = deck2.dequeue();
        //printErr("Old war size: " + war1.size());
        war1.enqueue(card1);
        war2.enqueue(card2);
        //printErr("New war size: " + war1.size());
        //printErr("comparing " + card1 + " vs " + card2 + " war size:" + war1.size() + " deck1: " +deck1.size() + " deck2: " + deck2.size());
        var cardVal1 = ComputeCard(card1);
        var cardVal2 = ComputeCard(card2);
        if (cardVal1 < cardVal2) {  //card2 is larger
            var n1 = war1.size();
            for (var i=0; i<n1; i++) {  //add all the cards from war2
                deck2.enqueue(war1.dequeue());
            }
            for (var i=0; i<n1; i++) { //add all the cards from war1
                deck2.enqueue(war2.dequeue());
            }
            n++;
            //printErr("round " + n + " " + card2 + " is bigger than " + card1);
        } else if (cardVal1 > cardVal2) { //car1 is larger
            var n1 = war1.size();
            for (var i=0; i<n1; i++) {  //add all the cards from war1
                deck1.enqueue(war1.dequeue());
            }
            for (var i=0; i<n1; i++) { //add all the cards from war2
                deck1.enqueue(war2.dequeue());
            }
            n++;
            //printErr("round " + n + " " + card1 + " is bigger than " + card2);
        } else { //WAR!
            if (deck1.size() < 3 || deck2.size() < 3) { //not enough for war
                pat = true;
                break;
            }
           
            for (var i=0; i<3; i++) {
                war1.enqueue(deck1.dequeue());
                war2.enqueue(deck2.dequeue());
            }
            
        }
    }
}

if (pat) {
    print('PAT');
} else {
    print(player + " " + n);
}

