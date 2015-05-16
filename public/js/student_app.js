var app = angular.module('studentViewApp', ['ngRoute'])

//define routes for the app, each route defines a template and a controller
app.config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/', {
      templateUrl : 'views/studentViewSortedByDate.html',
      controller  : 'StudentViewController'
    })
    .when('/studentDate', {
      templateUrl : 'views/studentViewSortedByDate.html',
      controller  : 'StudentViewController'
    })
    .when('/studentSubject', {
      templateUrl : 'views/studentViewBySubject.html',
      controller  : 'StudentViewController'
    })
    .otherwise({
      redirectTo: '/'
    });
//    $routeProvider
//        // HOME STATES AND NESTED VIEWS ========================================
//        .state('home', {
//            url: '/home',
//            templateUrl: 'partial-home.html'
//        })
//        
//        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
//        .state('about', {
//            // we'll get to this in a bit       
//        });
}]);

app.controller('StudentViewController', ['$scope', function($scope) {
  $scope.homeworks = [
      {
        title: 'Homework A',
        description: 'Pipat is Gay',
        image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
      },
    {
        title: 'Homework B',
        description: 'Pipat is Gay',
        image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
      },
    {
        title: 'Homework C',
        description: 'Pipat is Gay',
        image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
      },
        {
        title: 'Homework C',
        description: 'Pipat is Gay',
        image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
      },
        {
        title: 'Homework C',
        description: 'Pipat is Gay',
        image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
      },
        {
        title: 'Homework C',
        description: 'Pipat is Gay',
        image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
      },
  ];
    
  $scope.subjects = [
      {
        title: 'Math', 
        homeworks: [
          {
            title: 'Homework A',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            title: 'Homework B',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            title: 'Homework C',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      },
    {
        title: 'Chem', 
        homeworks: [
          {
            title: 'Homework D',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            title: 'Homework E',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            title: 'Homework F',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      },
    {
        title: 'Phys', 
        homeworks: [
          {
            title: 'Homework G',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            title: 'Homework H',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            title: 'Homework I',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      }
  ]
  
  $scope.items = [
  	{
      name: 'pizza', 
      ingredients: ['cheese', 'tomato', 'oregano', 'salt']
    },
  	{
      name: 'tortilla', 
      ingredients: ['butter', 'salt', 'pepper', 'garlic']
    },
  	{
      name: 'cake', 
      ingredients: ['cream', 'sugar']
    },
  	{
      name: 'empanada', 
      ingredients: ['flour', 'meat', 'onion']
    },
  	{
      name: 'empanada', 
      ingredients: ['flour', 'meat', 'onion']
    },
  	{
      name: 'empanada', 
      ingredients: ['flour', 'meat', 'onion']
    },
  	{
      name: 'empanada', 
      ingredients: ['flour', 'meat', 'onion']
    }
  ];
}]);