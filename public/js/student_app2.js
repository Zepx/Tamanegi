var app = angular.module('studentViewApp', ['ui.router', 'uiRouterStyles']);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider){
   
   var checkLoggedin = function($q, $timeout, $http, $location, $rootScope, $window) { 
      // Initialize a new promise 
      var deferred = $q.defer(); 

      // Make an AJAX call to check if the user is logged in 
      $http.get('/loggedin').success(function(user){ // Authenticated 
         if (user.status !== false ) 
            deferred.resolve(user, $location); 
         // Not Authenticated 
         else { 
            $rootScope.message = 'You need to log in.'; 
            deferred.reject(); 
            //Just hacking for now
            $window.location = 'http://localhost:3000/index.html#/login'
            
         } 
      }); 
      return deferred.promise; 
   };  
   
  $httpProvider.interceptors.push(function($q, $location) { 
       return { 
          response: function(response) { 
             return response;
          }, 
          responseError: function(response) { 
             if (response.status === 401) 
                $location.path('/login'); 
             return $q.reject(response); 
          } 
       }; 
    });

  // For any unmatched url, send to /route1
  //$urlRouterProvider.otherwise("/teacherhome/dashboard")
  $urlRouterProvider.otherwise("/studenthome")
  //$urlRouterProvider.otherwise("/dohomework")

  $stateProvider
//    .state('dohomework'), {
//        url: "/dohomework",
//        templateUrl: "route1.html"
//    }
    .state('login', {
        url: "/login",
        templateUrl: "views/login.html",
        controller: "LoginCtrl",
        data: {
         css: 'http://getbootstrap.com/examples/signin/signin.css'
        }
    })
    .state('usertype', {
         url: "/redirect",
         controller: "RedirectCtrl"
    })
    .state('teacherhome', {
        url: "/teacherhome",
        templateUrl: "views/homeTeacher.html",
        controller: "TeacherViewController"
    })
    .state('teacherhome.dashboard', {
        url: "/dashboard",
        templateUrl: "views/teacherDashboard.html",
        controller: "TeacherViewController",
        resolve: {
           loggedin: checkLoggedin
        }
    })
  
    .state('createhomework', {
        url: "/createhomework",
        templateUrl: "views/teacherCreateHomeWork.html",
        controller: "CreateHomeworkViewController"
    })
    .state('createhomework.questionnumber', {
        url: "/questionnumber/:questionId",
        templateUrl: "views/teacherQuestionEdit.html",
        controller: "CreateHomeworkViewByIdController"
    })
    .state('createhomework.addnewquestion', {
        url: "/createhomework/addnewquestion",
        templateUrl: "views/teacherCreateHomeWork.html",
        controller: "CreateHomeworkViewController"
    })
  
    .state('checkhomework', {
        url: "/checkhomework",
        templateUrl: "views/teacherCheckHomework.html",
        controller: "QuestionCheckIdController"
    })
    .state('checkhomework.questionnumber', {
        url: "/questionnumber/:questionId",
        templateUrl: "views/teacherCheckHomeworkDetail.html",
        controller: "QuestionCheckIdController"
    })
  
  // Student View Call here
    .state('studenthome', {
        url: "/studenthome",
        templateUrl: "views/home.html",
        resolve: {
           loggedin: checkLoggedin
        }
    })
    .state('studenthome.studentDate', {
          url: "/studentDate",
          templateUrl: "views/studentViewSortedByDate.html",
          controller: 'StudentViewController'
      })
    .state('studenthome.studentSubject', {
          url: "/studentSubject",
          templateUrl: "views/studentViewBySubject.html",
          controller: 'StudentViewController'
      })  
    .state('dohomework', {
        url: "/dohomework/:testId",
        templateUrl: "views/dohomework.html",
        controller: 'questionViewController'
    })
    .state('dohomework.questionId', {
        url: "/questionId/:itemId",
        templateUrl: "views/questionIdView.html",
        controller: 'questionWithIDViewController'
    })
//    .state('dohomework.questionId.show', {
//        url: "/questionId/:itemId/:partyLocation",
//        templateUrl: "route1.html",
//    })

});

/**********************************************************************
 * Login controller
 **********************************************************************/
app.controller('LoginCtrl', function($scope, $rootScope, $http, $location) {
  // This object will be filled by the form
  $scope.user = {};

  // Register the login() function
  $scope.login = function(){
    $http.post('/login', {
      username: $scope.user.username,
      password: $scope.user.password,
    })
    .success(function(user){
      // No error: authentication OK
      $rootScope.message = 'Authentication successful!';
      $location.url('/admin');
    })
    .error(function(){
      // Error: authentication failed
      $rootScope.message = 'Authentication failed.';
      $location.url('/login');
    });
  };
});
   
app.controller('QuestionCheckIdController', ['$scope', '$stateParams', '$http' ,function($scope, $stateParams, $http) {
  $scope.questionObject = {question_id: 1, title: 'Homework A', question_text: 'What is it?'};
  $http.get("/homeworks?teacher=me").success(function(data) {
     $scope.questions = data;
     console.log(data);
     
     if ($stateParams.questionId){
       $scope.qID = parseInt($stateParams.questionId) - 1 
       console.log($scope.qID);
       $scope.questionObject = $scope.questions[$scope.qID];
     }
     
     if ($scope.questions) {
        $http.get("db/answers.json").success(function(data) {
        $scope.answers = data;

        console.log(data);
     });
     }
  });
  
  
  
}]);

app.controller('CreateHomeworkViewByIdController', ['$scope', '$stateParams', function($scope, $stateParams) {
  $scope.showSetting = false
  $scope.questions = [
      {question_id: 1, title: 'Homework A', question_text: ''},
  ];
    $scope.fuckyou = $scope.questionText
  $scope.questionText =  $scope.questions[$stateParams.questionId].question_text
  $scope.qID = parseInt($stateParams.questionId) + 1
  $scope.newQuestion = function() {
    $scope.questions.push({
        question_id: 5, title: 'Homework A', question_text: ''
    });
  };
      
//    $scope.$watch(function($scope) {
//      return $scope.questions.
//          map(function(obj) {
//            return obj.question_text
//          });
//}, function (newVal) {
////        $scope.count++;
////        $scope.msg = 'person name was changed'+ $scope.count;
//    }, true);
    
    $scope.messageChanged = function() {
        $scope.fuckyou = $scope.questionText
        $scope.questions[$stateParams.questionId].question_text = $scope.questionText
        $scope.$apply();
        console.log($scope.questions[$stateParams.questionId].question_text);
    }
    
  //console.log($stateParams.qid);

}]);

app.controller('CreateHomeworkViewController', ['$scope', function($scope,  $state, $stateParams) {
  $scope.questions = [
      {question_id: 1, title: 'Homework A', question_text: 'What is it?'},
      {question_id: 2, title: 'Homework A', question_text: 'What is that?'},
      {question_id: 3, title: 'Homework A', question_text: 'What there?'},
      {question_id: 4, title: 'Homework A', question_text: 'What those?'},
  ];
    
  $scope.questionText = 'Oh Yeahhhhhhh!!!'

//  $scope.newQuestion = function() {
//    $scope.questions.push({
//        question_id: 5, title: 'Homework A', question_text: $scope.questionText
//    });
//  };

  $scope.textChange = function() {
    
  }
    
  //console.log($stateParams.qid);

}]);


app.controller('TeacherViewController', ['$scope','$http', function($scope,$http) {
  $http.get('tests?teacher=me').success(function(data) {
     $scope.homeworks = data;
  });
    
  $scope.subjects = [
      {
        title: 'Math', 
        homeworks: [
          {
            question_id: 123, title: 'Homework A',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework B',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework C',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      },
    {
        title: 'Chem', 
        homeworks: [
          {
            question_id: 123, title: 'Homework D',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework E',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework F',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      },
    {
        title: 'Phys', 
        homeworks: [
          {
            question_id: 123, title: 'Homework G',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework H',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework I',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      }
  ]
  
}]);

app.controller('AnswerSubmitController', ['$scope', '$http', function($scope, $http) {
  //$scope.list = [];
    //$scope.answertext = 'hello';
  $scope.submit = function() {
      //$scope.list.push(this.text);
      //$scope.text = '';
        $scope.motherChecker = $scope.answertext
      console.log($scope.motherChecker)
      console.log($scope.currentquestion);

      $http.post('/answer?id='+$scope.currentquestion.question_id, {answer_text: $scope.answertext}).success(function(data) {
          $scope.answerSubmited = true
          console.log(data);
          $scope.currentquestion.alternatives = data.alternatives;
          // update alternatives in data.alternatives
      });
  };
  $scope.motherChecker = 'This is mother checker';
  $scope.showAnswer = false;
    
  $scope.toggle = function() {
    //  $scope.answerSubmited = $scope.answerSubmited
      $http.post('/give_up?id='+$scope.currentquestion.question_id).success(function(data) {
          $scope.showAnswer = true;//!$scope.showAnswer
          console.log(data);
          $scope.currentquestion.alternatives = data.alternatives;
          // update alternatives in data.alternatives
      });
    //$scope.answertext = $scope.motherChecker
  };
    
  $scope.answerSubmited = false;
  $scope.closeAnswerPopUp = function() {
    $scope.answerSubmited = false;
  }
    
}]);

app.controller('questionWithIDViewController', ['$scope', '$stateParams', '$http', function($scope, $stateParams,$http) {
    var item = $stateParams.itemId;
    if (item == "" || item == undefined) {
        $http.get('/test?test='+$stateParams.testId).success(function(data) {
            $scope.currentquestion = {
                question_id: data.questions[0]._id,
                question_order: 1,
                question_text: data.questions[0].text,
                alternatives: data.questions[0].alternatives;
            };
            $scope.answertext = data.questions[0].answer;
        });
    } else {
        var parts = (item + "").split("-");
        $http.get('/question?id='+parts[1]).success(function(data) {
            $scope.currentquestion = {
                question_id: parts[1],
                question_order: parts[0],
                question_text: data.text,
                alternatives: data.alternatives;
            };
            $scope.answertext = data.answer;
        });
    }
}]);

    
app.controller('questionViewController', ['$scope', '$http', '$state', '$stateParams', function($scope,  $http, $state, $stateParams) {
    $http.get('/test?test='+$stateParams.testId).success(function(data) {
        var r = [];
        for (var i = 0; i < data.questions.length; i++) {
            var l = (i + 1) + "-" + data.questions[i]._id;
            r.push({q_link: l,
                    q_index: (i + 1), question_text: data.questions[i].text});
        }

        $scope.firstQuestion = r[0].q_link;
        $scope.id = $stateParams.testId;
        $scope.questions = r;
  });
  // $scope.questions = [
  //     {question_id: 1, title: 'Homework A', question_text: 'What is the future of the US-Saudi energy relationshipA?'},
  //     {question_id: 2, title: 'Homework A', question_text: 'What is the future of US-Saudi military ties?'},
  //     {question_id: 3, title: 'Homework A', question_text: 'What is the purpose of foreign aid?'},
  //     {question_id: 4, title: 'Homework A', question_text: 'Why should the government rather than private NGOs take the lead on aid?'},
  // ];
  //console.log($stateParams.qid);

}]);

app.controller('StudentViewController', ['$scope','$http', function($scope, $http) {
  $http.get("tests?user=me").success(function(data) {
     $scope.homeworks = data;
     console.log(data);
  });
    
  $scope.subjects = [
      {
        title: 'Math', 
        homeworks: [
          {
            question_id: 123, title: 'Homework A',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework B',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework C',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      },
    {
        title: 'Chem', 
        homeworks: [
          {
            question_id: 123, title: 'Homework D',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework E',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework F',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      },
    {
        title: 'Phys', 
        homeworks: [
          {
            question_id: 123, title: 'Homework G',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework H',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework I',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      }
  ]
  
}]);

