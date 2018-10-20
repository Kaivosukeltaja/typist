import angular from 'angular';
import _ from 'lodash';
import './style.css';
import template from './templates/index.html.js';

window.angular = angular;

const routeProvider = require('angular-route');
const resourceProvider = require('angular-resource');

angular
  .module('myapp', [
    'ngRoute',
    'ngResource'
  ])
  .config(['$routeProvider', function($routeProvider) {
    debugger;
    $routeProvider.
      when('/', {
        template: template,
        controller: 'KeyboardIndex'
      }).
      otherwise({
        redirectTo : '/'
      });
  }])
  .controller('KeyboardIndex', KeyboardIndex)
  
function KeyboardIndex($scope, $timeout) {

  document.onkeypress = function(e) {
    e = e || window.event;
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;

    var char = String.fromCharCode(charCode);
    $scope.register(char);
    $scope.$digest();
  };
  
  document.onkeydown = function(e) {
    e = e || window.event;
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    
    if(charCode === 8) {
      $scope.backspace();
    }
    
    if(charCode === 27) {
      $scope.completed();
    }

    $scope.$digest();
  };
  
  $scope.size = 5;
  
  $scope.generateText = function() {
    // var txt = angular.element('#words').text();
    var txt = document.getElementById('words').innerText;

    var words = txt
      .replace(/\W/g, '-')
      .replace(/-{2,}/g, '-')
      .toLowerCase()
      .split('-')
      .filter(function(word) {
        return word.length >= 3;
      });
    $scope.text = _.sampleSize(words, $scope.size).join(' ');
    $scope.letters = $scope.text.split('').map(function(letter) {
      return {
        letter : letter,
        done : false
      }
    });
  }
  
  $scope.stats = {
    keys : [],
    success : [],
    fails : [],
  };
  
  $scope.wpm = [];
  
  $scope.backspace = function() {
    if($scope.index === 0) return;
    $scope.index--;
  };
  
  $scope.completed = function() {
    $scope.index = 0;
    $scope.typed = '';
    $scope.generateText();
    $scope.start = new Date();
  };
  
  $scope.calcTime = function(start, end) {
    start = start.getTime() / 1000;
    end = end.getTime() / 1000;
    var seconds = Math.round(end - start);
    var wordCount = $scope.size;
    return Math.round((60 * wordCount) / seconds);
  };

  $scope.completed();
  $scope.register = function(char) {
    // console.info(char);
    var stat = {
      key : char,
      ts : +new Date()
    };
    $scope.stats.keys.push(stat);
    var charAtIndex = $scope.text.substr($scope.index, 1);
    
    if(charAtIndex == char) {
      
      $scope.letters[$scope.index].done = true;
      
      $scope.index++;
      $scope.typed += char;
      $scope.stats.success.push(stat);
    } else {
      $scope.stats.fails.push(stat);
    }
    
    if($scope.index === $scope.text.length) {
      var calc = $scope.calcTime($scope.start, new Date());
      $scope.wpm.push(calc);
      $scope.completed();        
    }
    
  };
}
KeyboardIndex.$inject = ['$scope', '$timeout'];
