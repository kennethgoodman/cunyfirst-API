var app = angular.module('userInfoApp', []);
app.directive('phoneNumberValidation', function() {
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
app.controller('userInputControl', function($scope){
  $scope.numberIsValid= function(){
    if($scope.inputForm.phoneNbrModel && $scope.inputForm.phoneNbrModel.$viewValue && $scope.inputForm.phoneNbrModel.$viewValue != undefined 
              && $scope.inputForm.email.$viewValue.length > 0 && $scope.inputForm.phoneNbrModel.$viewValue.length == 10 )
      return true
    else
      return false
  }
  $scope.carrierAndNumAreValid = function(){
    if($scope.numberIsValid() && $scope.inputForm.carrierModel && $scope.inputForm.carrierModel.$viewValue != undefined 
              && $scope.inputForm.carrierModel.$viewValue.trim() != '' && $scope.inputForm.carrierModel.$viewValue.trim() != 'default')
        return true
      
    else
      return false
  }
  $scope.emailIsValid = function(){
    if($scope.inputForm.email && $scope.inputForm.email.$viewValue && $scope.inputForm.email.$viewValue != undefined 
                && $scope.inputForm.email.$viewValue.length > 0 && $scope.inputForm.email.$valid){
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
});
//inputForm.phoneNbrModel.$touched && inputForm.phoneNbrModel.$invalid
//!(!!inputForm.phoneNbrModel.$viewValue && inputForm.phoneNbrModel.$valid && inputForm.carrierModel.$valid) && !(!!inputForm.email.$viewValue && inputForm.email.$valid)
//!(!!inputForm.phoneNbrModel.$viewValue && inputForm.phoneNbrModel.$valid) && !(!!inputForm.email.$viewValue && inputForm.email.$valid)