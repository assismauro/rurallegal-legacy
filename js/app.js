/*global stuff*/

var authenticate = false;

var sqlAdress = {
    //ip: 'http://localhost',
    ip: 'http://18.231.7.174',
    //server: 'http://localhost:81/'
    server: 'http://18.231.7.174/app/'
}


var globalUserData = {};
var tablesReport = {};

function formataNomCientifico(nome, autor = true) {

    var nameSize = nome.split(' ').length;

    if(nameSize > 2){
        var p1 = nome.replace(/\s*([a-z]+\s+[a-z]+)\s+.*/i, "$1");
        var p2 = nome.replace(/\s*[a-z]+\s+[a-z]+(\s+.*)/i, "$1");
    }else{
        var p1 = nome;
        var p2 = '';
    }

    /*var latin = {
        esp: p1,
        aut: p2
    }*/

    var html = '<span style="font-style:italic">' + p1 + "</span> ";
    if(autor) html += p2;

    return html;
}

var globalColorList = [
    "#2BCF88", "#9CAA20", "#822D19", "#87DF18", "#160350", "#4CD75E", 
    "#156B04", "#64C762", "#F7423E", "#DCE435", "#25531F", "#CDF169", 
    "#BE4E83", "#6F6063", "#1B604B", "#188D4A", "#165761", "#D44E8F", 
    "#281A03", "#726A63", "#1CA172", "#91A41D", "#61A647", "#4F2A54", 
    "#BBEB74", "#9BAF29", "#1EA303", "#72E34E", "#6F6801", "#FBB64E", 
    "#534B52", "#E7BA3F", "#1CD128", "#10C657", "#CE7045", "#2F6809", 
    "#748826", "#52E290", "#3EF258", "#235D6C", "#73642D", "#6DD012", 
    "#532078", "#7B1E02", "#EB8505", "#38F465", "#A9F374", "#1E8A4A", 
    "#99CE6C", "#B8F254", "#73F619", "#C5D952", "#42D94A", "#D29070", 
    "#E62C89", "#4FDE38", "#987B2D", "#C4C627", "#3CDB88", "#D38106", 
    "#81971E", "#C0701F", "#C0586C", "#9D9765", "#39E412", "#DFAB69", 
    "#552143", "#EAAE1B", "#E23D21", "#897D53", "#872260", "#D49409", 
    "#3F8791", "#134B31", "#E5C214", "#C6F445", "#7BB91E", "#EB7113", 
    "#437095", "#9DBC0C", "#3CB617", "#DE3079", "#467385", "#EE707A", 
    "#81E390", "#B99E84", "#92468B", "#7D355A", "#D3C895", "#938A55", 
    "#C26C6C", "#C5B03D", "#115708", "#08535E", "#0CAE41", "#DC6E7C", 
    "#65C661", "#970413", "#3D7583", "#2E8673"
];

/************************************************/

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'ngCordova', 'chart.js', 'app.controllers', 'app.routes', 'app.directives', 'app.services', 'angular.filter'])

.config(function($ionicConfigProvider, $sceDelegateProvider) {

    $ionicConfigProvider.scrolling.jsScrolling(true);

    $sceDelegateProvider.resourceUrlWhitelist(['self', '*://www.youtube.com/**', '*://player.vimeo.com/video/**']);

    $ionicConfigProvider.views.swipeBackEnabled(false);

    $ionicConfigProvider.backButton.previousTitleText(false).text('Voltar');

    $ionicConfigProvider.navBar.alignTitle('center');

    $ionicConfigProvider.views.transition('none'); 

})

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            cordova.plugins.Keyboard.disableScroll(true);
        }

        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

/*
  This directive is used to disable the "drag to open" functionality of the Side-Menu
  when you are dragging a Slider component.
*/
.directive('disableSideMenuDrag', ['$ionicSideMenuDelegate', '$rootScope', function($ionicSideMenuDelegate, $rootScope) {
    return {
        restrict: "A",
        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {

            function stopDrag() {
                $ionicSideMenuDelegate.canDragContent(false);
            }

            function allowDrag() {
                $ionicSideMenuDelegate.canDragContent(true);
            }

            $rootScope.$on('$ionicSlides.slideChangeEnd', allowDrag);
            $element.on('touchstart', stopDrag);
            $element.on('touchend', allowDrag);
            $element.on('mousedown', stopDrag);
            $element.on('mouseup', allowDrag);

        }]
    };
}])

/*
  This directive is used to open regular and dynamic href links inside of inappbrowser.
*/
.directive('hrefInappbrowser', function() {
    return {
        restrict: 'A',
        replace: false,
        transclude: false,
        link: function(scope, element, attrs) {
            var href = attrs['hrefInappbrowser'];

            attrs.$observe('hrefInappbrowser', function(val) {
                href = val;
            });

            element.bind('click', function(event) {

                window.open(href, '_system', 'location=yes');

                event.preventDefault();
                event.stopPropagation();

            });
        }
    };
})

//authentication
.run(function($rootScope, $state) {
    $rootScope.$on("$stateChangeStart", function(event, to) {
        if (to.authenticate == undefined && !authenticate) {
            $state.go("login");
            event.preventDefault();
        }
    });
});