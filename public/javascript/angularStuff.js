var userInfoApp = angular.module('userInfoApp', ['ngMessages']);
userInfoApp.directive('phoneNumberValidation', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attr, mCtrl) {
      function myValidation(value) {
        if (value.length != 10) {
          mCtrl.$setValidity('phoneNum', false);
        } else {
          mCtrl.$setValidity('phoneNum', true);
        }
        return value;
      }
      mCtrl.$parsers.push(myValidation);
    }
  };
});
userInfoApp.controller('userInputControl', function($scope){
  $scope.validityOfVariable = function(variable){
    if(variable && variable.$viewValue != undefined && variable.$viewValue != null)
      return true
    else
      return false
  }
  $scope.numberIsValid = function(){
    var num = $scope.inputForm.phoneNbrModel 
    if($scope.validityOfVariable(num) && num.$viewValue != "" && num.$viewValue.length == 10 ){
      return true
    }
    else
      return false
  }
  $scope.carrierAndNumAreValid = function(){
    var carrier = $scope.inputForm.carrierModel
    if($scope.numberIsValid() && $scope.validityOfVariable(carrier) && carrier.$viewValue.trim() != '' && carrier.$viewValue.trim() != 'default')
        return true 
    else
      return false
  }
  /*
  $scope.emailIsValid = function(){
    var email = $scope.inputForm.email
    if($scope.validityOfVariable(email) && email.$valid){
      return true
    }
    else{
      return false
    }
  }
  $scope.infoValid = function(){
    if($scope.carrierAndNumAreValid() || $scope.emailIsValid())
      return true
    else
      return false
  }
  $scope.emailNotEmpty = function(){
    var email = $scope.inputForm.email
    if($scope.validityOfVariable(email) && email.$viewValue != "")
      return true
    return false
  }*/
});

/*
var classInfo = angular.module('classInfo', ['ngMessages']);
classInfo.controller('classInfoControl', function($scope){
  $scope.enoughClasses = function(){
    console.log(queryArray)
    console.log(queryArray.length)
    if(queryArray.length > 1) return true
    else return false
  }
})*/


//inputForm.phoneNbrModel.$touched && inputForm.phoneNbrModel.$invalid
//!(!!inputForm.phoneNbrModel.$viewValue && inputForm.phoneNbrModel.$valid && inputForm.carrierModel.$valid) && !(!!inputForm.email.$viewValue && inputForm.email.$valid)
//!(!!inputForm.phoneNbrModel.$viewValue && inputForm.phoneNbrModel.$valid) && !(!!inputForm.email.$viewValue && inputForm.email.$valid)