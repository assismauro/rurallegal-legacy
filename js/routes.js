angular.module('app.routes', [])

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            .state('login', {
                url: '/page0',
                cache: false,
                templateUrl: 'templates/login.html',
                controller: 'loginCtrl',
                authenticate: false
            })

            .state('cadastro', {
                url: '/page1',
                cache: false,
                templateUrl: 'templates/cadastro.html',
                controller: 'cadastroCtrl',
                authenticate: false
            })

            .state('home', {
                url: '/page2',
                cache: false,
                templateUrl: 'templates/home.html',
                controller: 'homeCtrl'
            })

            .state('suaConta', {
                url: '/page13',
                cache: false,
                templateUrl: 'templates/suaConta.html',
                controller: 'suaContaCtrl',
                resolve: {
                    valid: function ($q, fromServer) {
                        var def = $q.defer();

                        fromServer.validateUser(globalUserData.login.usuario, globalUserData.login.senha).success(
                            function (res) {
                                def.resolve(res);
                            }
                        );

                        return def.promise;
                    }
                }
            })

            .state('faleConosco', {
                url: '/page12',
                cache: false,
                templateUrl: 'templates/faleConosco.html',
                controller: 'faleConoscoCtrl'
            })

            .state('modelos', {
                url: '/page3',
                cache: false,
                templateUrl: 'templates/modelos.html',
                controller: 'modelosCtrl',
                resolve: {
                    valid: function ($q, fromServer) {
                        var def = $q.defer();

                        fromServer.validateUser(globalUserData.login.usuario, globalUserData.login.senha).success(
                            function (res) {
                                def.resolve(res);
                            }
                        );

                        return def.promise;
                    }
                }
            })

            .state('localizaO', {
                url: '/page4',
                cache: true,
                templateUrl: 'templates/localizaO.html',
                controller: 'localizaOCtrl'
            })

            .state('ondePlantarSP', {
                url: '/page5',
                cache: false,
                templateUrl: 'templates/ondePlantarSP.html',
                controller: 'ondePlantarSPCtrl'
            })

            .state('distribuiO', {
                url: '/page6',
                cache: false,
                templateUrl: 'templates/distribuiO.html',
                controller: 'distribuiOCtrl'
            })

            .state('espCiesCarroChefe', {
                url: '/page7',
                cache: true,
                templateUrl: 'templates/espCiesCarroChefe.html',
                controller: 'espCiesCarroChefeCtrl'
            })

            .state('biodiversidade', {
                url: '/page8',
                cache: true,
                templateUrl: 'templates/biodiversidade.html',
                controller: 'biodiversidadeCtrl'
            })

            .state('verModelo', {
                url: '/page10',
                cache: true,
                templateUrl: 'templates/verModelo.html',
                controller: 'verModeloCtrl'
            })

            .state('exportarModelo', {
                url: '/page11',
                cache: false,
                templateUrl: 'templates/exportarModelo.html',
                controller: 'exportarModeloCtrl'
            })


            .state('enciclopediaIndex', {
                url: '/page14',
                templateUrl: 'templates/enciclopediaIndex.html',
                controller: 'enciclopediaIndexCtrl',
                cache: false
            })

            .state('enciclopediaDados', {
                url: '/page15',
                templateUrl: 'templates/enciclopediaDados.html',
                controller: 'enciclopediaDadosCtrl',
                cache: false
            })

            .state('enciclopediaEspecie', {
                url: '/page16',
                templateUrl: 'templates/enciclopediaEspecie.html',
                controller: 'enciclopediaEspecieCtrl',
                cache: false
            })

            .state('enciclopediaTopico', {
                url: '/page17',
                templateUrl: 'templates/enciclopediaTopico.html',
                controller: 'enciclopediaTopicoCtrl',
                cache: false
            })

            .state('safHorizonte', {
                url: '/page18',
                templateUrl: 'templates/safHorizonte.html',
                controller: 'safHorizonteCtrl'

            })

            .state('selecionaEspSAF', {
                url: '/page19',
                templateUrl: 'templates/selecionaEspSAF.html',
                controller: 'selecionaEspSAFCtrl'

            })

            .state('safEspaco', {
                url: '/page20',
                templateUrl: 'templates/safEspaco.html',
                controller: 'safEspacoCtrl'

            })

            .state('montaCroqui', {
                url: '/page21',
                templateUrl: 'templates/montaCroqui.html',
                controller: 'montaCroquiCtrl',
                cache: true

            })

            .state('baixaCroqui', {
                url: '/page22',
                templateUrl: 'templates/baixaCroqui.html',
                controller: 'baixaCroquiCtrl'

            })

            .state('prescricaoSAF', {
                url: '/page23',
                templateUrl: 'templates/prescricaoSAF.html',
                controller: 'prescricaoSAFCtrl'

            })

            .state('fluxoCaixaSAF', {
                url: '/page25',
                templateUrl: 'templates/fluxoCaixaSAF.html',
                controller: 'fluxoCaixaSAFCtrl'
            })

            .state('montaPropriedade', {
                url: '/page26',
                templateUrl: 'templates/montaPropriedade.html',
                controller: 'montaPropriedadeCtrl',
                resolve: {
                    valid: function ($q, fromServer) {
                        var def = $q.defer();

                        fromServer.validateUser(globalUserData.login.usuario, globalUserData.login.senha).success(
                            function (res) {
                                def.resolve(res);
                            }
                        );

                        return def.promise;
                    }
                }
            })

            .state('baixaMapaPropriedade', {
                url: '/page27',
                templateUrl: 'templates/baixaMapaPropriedade.html',
                controller: 'baixaMapaPropriedadeCtrl'
            })

            .state('youTube', {
                url: '/page28',
                templateUrl: 'templates/youTube.html',
                controller: 'youTubeCtrl'
            })

        $urlRouterProvider.otherwise('/page0')

    });