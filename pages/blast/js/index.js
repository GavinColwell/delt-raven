var nums;
var msg;
var names;

function cleanPhoneNum(num){
  var cleaned = num.replace(/\D/g, ""); // removes non digit chars
  if (cleaned.length == 10 ){
    return "+1"+cleaned;
  }
  else if (cleaned.length == 11){
    return "+"+cleaned;
  }
  else {
    return -1;
  }
}

function PageController($scope) {
    var socket = io.connect("/blast");
    
    $scope.messages = [];
    $scope.roster = [];
    $scope.numbers = [];
    $scope.name = '';
    $scope.text = '';
    $scope.userNum = '';
    $scope.showNum = "";
    
    socket.on('message', function (msg) {
      $scope.messages.push(msg);
      $scope.$apply();
    });
    
    socket.on('userNumber',function (num){
      console.log(num);
      $scope.userNum = num;
      $scope.$apply();
    });
    
    $scope.send = function send() {
      console.log('Sending message:', $scope.text);
      socket.emit('message', {
        body: $scope.text,
        to: $scope.showNum,
        from: $scope.userNum,
        dir: "outbound"
      });
      $scope.text = '';
    };
    
    
    // debug

    $scope.test = function() {
        nums = document.querySelector("#num-field").value.split("\n");
        msg = document.querySelector("#msg-field").value;
        names = document.querySelector("#names-field").value.split("\n");
        
        for (var i = 0; i < nums.length; i++){
          var text = msg.replace(/{name}/, function(x) {
            return names[i];
          });
          console.log(text);
          var to = cleanPhoneNum(nums[i]);
          
          if (to != -1){
            var data = {
              body: text,
              to: to,
              from: $scope.userNum
            };
            socket.emit("message",data);
            console.log(data);
          }
          else{
            console.log(`Invalid number: ${nums[i]}`);
          }
          
        }
        
      
    };
    

}