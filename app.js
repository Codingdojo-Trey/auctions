
////////////////////////start of server stuff/////////////////
var http = require('http');
var fs = require('fs');
var io = require('socket.io');
var server = http.createServer(function (request, response){
 //set path of index page
 if(request.url == "/index.html"){
  file_path = "index.html"
  //load needed pages and static files
  fs.readFile(file_path, function(error, data){
   response.writeHead(200, {"Content-Type": "text/html"});  
   response.write(data);
   response.end();
  });
 } else {
  response.writeHead(500, {"Content-Type": "text/html"});
  response.write('File not found!!');
  response.end();
 }  
}); 
////////////////end of server stuff//////////////////////////
////////////////////start of auction stuff////////////////////
var counter = 0;
function Auction(item_name, bid_amt){
    this.id = counter;
    counter ++;
    this.name = item_name;
    this.bid = bid_amt;
    this.winner = 'BE THE FIRST TO BID';
    this.update = function(name, amt){
      this.bid = amt;
      this.winner = name;
    };
}

var chair = new Auction('chair', 400);
var hat = new Auction('hat', 30);
var auctions = [chair, hat];
////////////////////end of auction stuff ////////////////////
//////////////socket stuff begins here /////////////////////
var sockets = io.listen(server);
//listening to connection event
sockets.on('connection', function (socket){
 //listening to send message event

 socket.on('get_auctions', function (message){
  socket.emit('give_auctions', auctions);
  console.log('#################auctions given!######################')
  console.log(message);
 });

 socket.on('add_new', function (auction){
  console.log('#########################add new auction ################')
  var new_auction = new Auction(auction.name, auction.price);
  auctions.push(new_auction);
  //give new auction to everyone!//
  socket.emit('give_auctions', [new_auction]);
  socket.broadcast.emit('give_auctions', [new_auction]); 
  console.log(auctions);
 });

 socket.on('update_auction', function (auction){
  console.log('##############################bid up in dis biach!')
  console.log(auction);
  var id = auction.id;
  auctions[id].update(auction.name, auction.bid);
  socket.emit('give_new_auctions', auctions);

 });
});
server.listen(8080);
console.log('Server running in localhost port 8080')
/////////////////////////end of socket stuff /////////////////