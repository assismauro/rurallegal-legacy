angular.module('app.directives', [])

.directive('qmark', [function(){

    return {
        restrict: 'E',
        template: "<div>?</div>",
        scope: {ref:"="}
    }

}])