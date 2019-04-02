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
    

    $scope.numbers = [];
    $scope.name = '';
    $scope.text = '';
    $scope.userNum = '';
    $scope.showNum = "";
    $scope.tested = false;
    $scope.sids = [];
    
    
    socket.on('userNumber',function (num){
      console.log(num);
      $scope.userNum = num;
      $scope.$apply();
    });
    
    socket.on("messageSent", function(sid){
      console.log(sid);
      $scope.sids.push(sid);
    })
    
    $scope.send = function send() {
      var nums = document.querySelector("#num-field").value.split("\n");
      var msg = document.querySelector("#msg-field").value;
      var names = document.querySelector("#names-field").value.split("\n");
      var sororities = document.querySelector("#sorority-field").value.split("\n");
      
      $scope.tested = false;
      
      for (var i = 0; i < nums.length; i++){
        
        // adds name to the message
        var text = msg.replace(/{name}/, function(x) {
          return names[i];
        });
        // adds sorority to the message
        text = text.replace(/{sorority}/, function(x) {
          return sororities[i];
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
      document.querySelector("#num-field").value = "";
      document.querySelector("#names-field").value = "";
      document.querySelector("#msg-field").value = "";
      document.querySelector("#sorority-field").value = "";
      
      
        
    };
    
    
    // debug

    $scope.test = function() {
        var nums = document.querySelector("#num-field").value.split("\n");
        var msg = document.querySelector("#msg-field").value;
        var names = document.querySelector("#names-field").value.split("\n");
        var sororities = document.querySelector("#sorority-field").value.split("\n");
        
        $scope.tested = true;
        
        for (var i = 0; i < nums.length; i++){
          
          // adds name to the message
          var text = msg.replace(/{name}/, function(x) {
            return names[i];
          });
          // adds sorority to the message
          text = text.replace(/{sorority}/, function(x) {
            return sororities[i];
          });
          
          
          var to = cleanPhoneNum(nums[i]);
          alert(`to ${to} body ${text}`);
          break;
        }
        
      
    };
    

}