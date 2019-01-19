var text;
function PageController($scope) {
    var socket = io.connect("/dashboard");
    
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
        text = document.querySelector("#vars").value;
        console.log(text);
        
        console.log(text.split("\t"));
    };
    

}