angular.module('app.controllers', [])

.controller('loginCtrl', ['$scope', '$stateParams', '$ionicHistory', '$ionicPopup', 'storeValues', '$state', 'fromServer', function($scope, $stateParams, $ionicHistory, $ionicPopup, storeValues, $state, fromServer) {

    $scope.login = {};
    $scope.loginFailHide = true;

    function checkUser() {

        fromServer.validateUser($scope.login.usuario, $scope.login.senha).success(
            function(res) {

                if (res == 'autorizado') {
                    authenticate = true;
                    $scope.loginFailHide = true;
                    storeValues.set('dicas', true);
                    storeValues.set('dicasSAF', true);
                    storeValues.set('dicasENC', true);
                    storeValues.set('dicasMPR', true);                    

                    if ($scope.login.save) {
                        storeValues.set('user', $scope.login.usuario);
                        storeValues.set('pass', $scope.login.senha);
                    }

                    globalUserData.login = $scope.login;

                    $state.go('home');
                } else {
                    authenticate = false;
                    $scope.loginFailHide = false;
                }
            })
    }

    $scope.disableBackButton = function(bool) {

        if (bool) {

            checkUser();

        } else {

            $scope.loginFailHide = true;

        }

        $ionicHistory.nextViewOptions({
            disableBack: bool
        });
    }


    //forgotten password

    function dataAlert(info, recursive = true) {
        if (recursive) $scope.getNewPass();
        var alertPopup = $ionicPopup.alert({
            title: info,
        });
    }

    $scope.forgotten = {};
    $scope.getNewPass = function() {

        var forgotPass = $ionicPopup.show({
            template: '<input type="text" placeholder="usu\u00e1rio" ng-model="forgotten.user"><br><input type="email" placeholder="email" ng-model="forgotten.email">',
            title: 'Esqueceu sua senha?',
            subTitle: 'Informe seu usu\u00e1rio e email cadastrados',
            scope: $scope,
            buttons: [{
                    text: 'Cancelar',
                    onTap: function(e) {
                        return;
                    }
                },
                {
                    text: '<b>Enviar</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (!$scope.forgotten) {
                            e.preventDefault();
                        } else {
                            if (!$scope.forgotten.user || $scope.forgotten.user == '') {
                                dataAlert('Informe um nome de usu\u00e1rio v\u00e1lido.');
                                return;
                            } else if (!$scope.forgotten.email) {
                                dataAlert('Informe email v\u00e1lido.');
                                return;
                            }

                            $scope.loading = true;
                            fromServer.changePassword($scope.forgotten.user, $scope.forgotten.email).success(function(res) {
                                dataAlert(res, false);
                                $scope.loading = false;
                            }).error(err => console.log(err));

                        }
                    }
                }
            ]
        });
    }

    //autologin
    void

    function() {
        if (storeValues.get('user') && storeValues.get('pass')) {
            globalUserData.login = { usuario: storeValues.get('user'), senha: storeValues.get('pass') };
            authenticate = true;
            $state.go('home');
        };
    }();

}])

.controller('cadastroCtrl', ['$scope', '$stateParams', '$state', '$ionicPopup', 'fromServer', function($scope, $stateParams, $state, $ionicPopup, fromServer) {

    //console.log(navigator.connection.type);
    //console.log(Connection.NONE);

    function internetAlert() {
        var alertPopup = $ionicPopup.alert({
            title: 'Conex\u00e3o n\u00e3o detectada',
            template: 'Conecte-se \u00e0 internet para se cadastrar.'
        });
    }

    function checkInternet() {

        if (navigator.connection.type == Connection.NONE) {
            internetAlert();
            return false;
        } else {
            return true;
        }

    }
    checkInternet();

    $scope.userData = {};

    function formIncomplete(campo) {
        var alertPopup = $ionicPopup.alert({
            title: 'Informa\u00e7\u00f5es necess\u00e1rias faltando',
            template: 'Preencha o campo <strong>' + campo + '</strong>'
        });
    };

    function passNoMatch() {
        var alertPopup = $ionicPopup.alert({
            title: 'Senhas n\u00e3o correspondem',
            template: 'Preenha sua senha novamente'
        });
        $scope.userData.pass1 = '';
        $scope.userData.pass2 = '';
    };

    function getEstado() {
        $scope.loading = true;
        var query = "select * from rl.rlestado";

        fromServer.pullData(query).success(
            function(res) {
                $scope.estados = res;
                $scope.loading = false;
            })
    }
    getEstado();

    function userTry(phrase) {
        var alertPopup = $ionicPopup.alert({
            title: phrase
        });
    }

    $scope.checkNewUser = function(form) {

        var conn = checkInternet();

        if (!conn) {

            return;

        } else if (!form.user) {

            formIncomplete('Usu\u00e1rio');

        } else if (!form.pass1) {

            formIncomplete('Senha');

        } else if (!form.pass2) {

            formIncomplete('Confirme a senha');

        } else if (!form.name) {

            formIncomplete('Nome completo');

        } else if (!form.email) {

            formIncomplete('E-mail');

        } else if (form.pass1 !== form.pass2) {

            passNoMatch();

        } else {

            $scope.loading = true;
            fromServer.registerUser(form).success(
                function(res) {
                    var msg = res[0].msg;
                    userTry(msg);
                    if (msg == 'Usu\u00e1rio criado com sucesso.') {

                        fromServer.sendEmail(form.user, form.email).success(
                            function(res) {
                                //console.log(res);
                                return;
                            });
                        $state.go('login');
                    }
                    $scope.loading = false;
                }).error(function(err) {
                console.log(err);
                $scope.loading = false;
            })

        }

    }

}])

.controller('homeCtrl', ['$scope', '$stateParams', '$state', '$ionicPopup', 'storeValues', '$ionicHistory', 'showDica', '$rootScope', '$timeout', function($scope, $stateParams, $state, $ionicPopup, storeValues, $ionicHistory, showDica, $rootScope, $timeout) {

    $rootScope.promptDicas = showDica.show;

    $scope.$on("$ionicView.enter", function(event, data) {
        screen.orientation.unlock();       
        delete $rootScope.dicas;        
    });

    function internetAlert() {
        var alertPopup = $ionicPopup.alert({
            title: 'Sem internet...',
            template: 'Para continuar neste modulo \u00E9 preciso estar conectado.'
        });
    };

    $scope.checkConnection = function(state) {
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';

        if (states[networkState] == states[Connection.NONE]) {
            internetAlert();
        } else {
            $ionicHistory.clearCache().then(function() {
                var login = globalUserData.login;
                globalUserData = { login: login };
                $state.go(state);
                $scope.loading = false;
            });
        }
    }

    $scope.logout = function() {
        storeValues.destroy('user');
        storeValues.destroy('pass');
        storeValues.destroy('dicas');
        storeValues.destroy('dicasSAF');
        storeValues.destroy('dicasENC');
        storeValues.destroy('dicasMPR');        
        $state.go('login');
    }

}])

.controller('suaContaCtrl', ['$scope', '$stateParams', '$state', 'fromServer', '$ionicPopup', 'storeValues', 'valid', function($scope, $stateParams, $state, fromServer, $ionicPopup, storeValues, valid) {

    $scope.edita = false;
    $scope.b3 = 'deactivated';

    //check user
    function getUser() {
        $scope.loading = true;
        query = "select us.*, es.siglaEstado from rl.RLUSUARIO us left join rl.RLESTADO es on us.idEstado = es.idEstado where us.nomUsuario = '" + globalUserData.login.usuario + "'";

        fromServer.pullData(query).success(function(res) {
            globalUserData.usuario = res[0];
            $scope.usuario = res[0];
            $scope.alteraUsuario = JSON.parse(JSON.stringify(res[0]));
            $scope.loading = false;
        }).error(err => console.log(err));
    }

    void

    function() {

        var logg = globalUserData.login;
        globalUserData = { login: logg };

        if (valid !== 'autorizado') {
            storeValues.destroy('user');
            storeValues.destroy('pass');
            $state.go('login');
        } else {
            $scope.loading = true;
            var queryEstado = "select * from rl.rlestado";
            fromServer.pullData(queryEstado).success(function(res) {
                $scope.estados = res;
                getUser();
            });
        }
    }();

    function passNoMatch() {
        var alertPopup = $ionicPopup.alert({
            title: 'Senhas n\u00e3o correspondem',
            template: 'Preenha sua senha novamente'
        });
    };

    function emailNoMatch() {
        var alertPopup = $ionicPopup.alert({
            title: 'Email inv\u00e1lido',
            template: 'Preenha um email v\u00e1lido'
        });
    };

    function dataChanged(msg) {
        var alertPopup = $ionicPopup.alert({
            title: msg
        });
    };

    $scope.edicao = function(bool) {

        if (bool) {
            $scope.edita = true;
            $scope.b1 = 'buttonStyleClicked';
            $scope.b3 = '';
        } else {
            $scope.edita = false;
            $scope.b1 = '';
            $scope.b3 = 'deactivated';
        }

    }

    $scope.b3Style = function(click) {

        if (!$scope.edita) {
            $scope.b3 = 'deactivated';
        } else if (click) {
            $scope.b3 = 'buttonStyleClicked'
            $scope.alteraDados();
        } else {
            $scope.b3 = '';
        }

    }

    $scope.alteraDados = function() {

        if (!$scope.edicao) return;

        if ($scope.alteraUsuario.s1 == '') delete $scope.alteraUsuario.s1;
        if ($scope.alteraUsuario.s2 == '') delete $scope.alteraUsuario.s2;

        if ($scope.alteraUsuario.s1 !== $scope.alteraUsuario.s2) {
            passNoMatch();
        } else if (!$scope.alteraUsuario.email) {
            emailNoMatch();
        } else {
            $scope.loading = true;
            fromServer.updateUserData($scope.alteraUsuario).success(
                function(res) {
                    dataChanged(res);

                    if (res == '"Dados alterados com sucesso"') {
                        if (storeValues.get('pass') && $scope.alteraUsuario.s1) {
                            storeValues.set('pass', $scope.alteraUsuario.s1);
                        }
                        $state.go('home');
                    }

                    getUser();

                }
            )
        }

    }

}])

.controller('faleConoscoCtrl', ['$scope', '$stateParams', '$state', '$cordovaSocialSharing', function($scope, $stateParams, $state, $cordovaSocialSharing) {


    $scope.shareEmail = function() {
        $cordovaSocialSharing
            .shareViaEmail('', 'Contato Rural Legal', 'rural.legal@gmail.com', null, null)
            .then(function(result) {
                // Success!
            }, function(err) {
                console.log(err);
            });
    }


}])

.controller('modelosCtrl', ['$scope', '$stateParams', '$state', 'fromServer', 'storeValues', 'valid', 'linkHelp', '$ionicHistory', '$ionicPopup', '$ionicScrollDelegate', function($scope, $stateParams, $state, fromServer, storeValues, valid, linkHelp, $ionicHistory, $ionicPopup, $ionicScrollDelegate) {

    $scope.dicas = {
        flo: storeValues.get('dicas') === 'true',
        saf: storeValues.get('dicasSAF') === 'true'
    }

    $scope.linkHelp = function(info) {

        $scope.loading = true;

        linkHelp.set('Modelos');

        linkHelp.call().success(function(res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    $scope.modelosProjeto = [{ area: 'RL', help: 14 }, { area: 'ACNP', help: 16 }
        //, {area: 'APP', help: 15}
    ];

    function filterProjs(list, idFim) {

        var projs = list.filter(x => x.idFinalidade == idFim);

        var idServer = sqlAdress.server + 'files/';

        var files = projs.map(function(x) {
            var obj = {
                name: idServer + x.nomRecomendacao,
                proj: x.idRecomendacao,
                dat: x.datProjeto.date.substring(8, 10) + '/' + x.datProjeto.date.substring(5, 7) + '/' + x.datProjeto.date.substring(0, 4),
                desc: x.nomMunicipio + ', ' + x.nomFitoecologia + ', ' + x.nomModelo
            };

            return obj;
        });

        return files;

    }

    $scope.openProject = function(address, flo = true) {
        if (!flo) address = sqlAdress.server + 'files/' + address;

        cordova.InAppBrowser.open(address, '_system', 'location=no');
    };

    $scope.shareProject = function(address, flo = true) {

        if (!flo) address = sqlAdress.server + 'files/' + address;

        var msg = flo ? 'Veja meu projeto de reflorestamento!' : "'Veja meu projeto de SAF!'";

        var options = {
            message: msg,
            subject: 'Projeto Rural Legal',
            files: [address]
        }

        var onSuccess = function(result) {
            console.log("Share completed? " + result.completed);
            console.log("Shared to app: " + result.app);
        }

        var onError = function(msg) {
            console.log("Sharing failed with message: " + msg);
        }

        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    }

    var projLoaded = false;
    $scope.loadProjects = function() {

        if (projLoaded) return;

        $scope.loading = true;

        var query = "exec RL.RLListaProjetosFLO " + globalUserData.usuario.idUsuario;

        fromServer.pullData(query).success(function(res) {

            for (var i = 0; i < $scope.modelosProjeto.length; ++i) {
                pCount = filterProjs(res, i + 1);
                $scope.modelosProjeto[i].files = pCount;
                $scope.modelosProjeto[i].class = (pCount == 0) ? 'semProjeto' : '';
            }

            $ionicScrollDelegate.resize();
            projLoaded = true;
            $scope.loading = false;

        }).error(err => console.log(err));

        //console.log(query);

    }

    //check user
    function getUser() {
        $scope.loading = true;
        query = "select * from rl.rlusuario where nomUsuario = '" + globalUserData.login.usuario + "'";

        fromServer.pullData(query).success(function(res) {
            globalUserData.usuario = res[0];
            $scope.loading = false;
        });
    }

    void function() {

        var logg = globalUserData.login;
        globalUserData = { login: logg };

        if (valid !== 'autorizado') {
            storeValues.destroy('user');
            storeValues.destroy('pass');
            $state.go('login');
        } else {
            getUser();
        }
    }();

    //style
    $scope.projDownButtons = {};
    $scope.activateItem = function(item, deac = false) {

        if (!deac) $scope.projDownButtons[item] = !$scope.projDownButtons[item];

        $scope.itemClass = {};
        $scope.itemClass[item] = deac ? '' : 'toggleItemActive';

        $ionicScrollDelegate.resize();        

    }

    $scope.startProject = function() {
        $scope.loading = true;

        storeValues.set('dicas', $scope.dicas.flo);

        var query = `declare @idUser int = USID
                     declare @nProj table( idRed int )

                     insert @nProj select idrecomendacao from rl.rlrecomendacao where idUsuario = @idUser and idRecomTipo = 1 and datProjeto IS NULL

                     IF (select count(*) from @nProj) > 0
	                    BEGIN
		                    delete from RL.RLRECOMENDACAO WHERE idRecomendacao IN (select * from @nProj)
	                    END

                     EXEC RL.RLAtualiza 0, 'novo_projeto', @idUser`;

        query = query.replace('USID', globalUserData.usuario.idUsuario);

        fromServer.pullProc(query).success(function(res) {
            globalUserData.projectID = res[0][''];

            if (storeValues.get('dicas') == 'true') {
                var dicasQuery = "select * from rl.RLDICASAPLICATIVO where moduloApp = 'FLO'";

                fromServer.pullData(dicasQuery).success(function(res) {
                    globalUserData.dicas = res;

                    $ionicHistory.clearCache().then(function() {
                        $state.go('localizaO');
                        $scope.loading = false;
                    });
                }).error(x => console.log(x));

            } else {
                $ionicHistory.clearCache().then(function() {
                    $state.go('localizaO');
                    $scope.loading = false;
                });
            }

        })

    }

    function msgDeletaProjeto(msg) {
        var alertPopup = $ionicPopup.alert({
            title: msg
        });
    };

    $scope.confirmaDeleta = function(idRec, isFlo = true){
        var alertPopup = $ionicPopup.show({
            title: 'Apagar modelo',
            template: 'Tem certeza de que deseja remover o modelo?',
            buttons: [
                {
                    text: 'Não',
                    type: 'button-positive',
                    onTap: function () {
                        return;
                    }
                },{
                    text: 'Sim',
                    type: 'button-stable',
                    onTap: function () {
                        $scope.deletaProjeto(idRec, isFlo);
                        return;
                    }
                }]
        });
    };

    $scope.deletaProjeto = function(idProj, flo) {

        var query = 'exec RL.RLRemoveRecomendacao ' + idProj;

        fromServer.pullProc(query).success(function(res) {
            msgDeletaProjeto(res[0].msg);
            if (flo) {
                projLoaded = false;
                $scope.loadProjects();
            } else {
                safLoaded = false;
                $scope.loadSAFs();
            }
        }).error(x => msgDeletaProjeto(x));
    }



    //SAF

    $scope.startSAF = function() {
        $scope.loading = true;

        storeValues.set('dicasSAF', $scope.dicas.saf);

        if (storeValues.get('dicasSAF') == 'true') {
            var dicasQuery = "select * from rl.RLDICASAPLICATIVO where moduloApp = 'SAF'";

            fromServer.pullData(dicasQuery).success(function(res) {
                globalUserData.dicasSAF = res;

                $ionicHistory.clearCache().then(function() {
                    $state.go('safHorizonte');
                    $scope.loading = false;
                });
            }).error(x => console.log(x));

        } else {
            $ionicHistory.clearCache().then(function() {
                $state.go('safHorizonte');
                $scope.loading = false;
            });
        }

    }

    var safLoaded = false;

    $scope.modelosProjetoSAF = [
        { tipo: 'Privado', help: 72, class:'' }, 
        { tipo: 'P\u00FAblico', help: 71, class:'' }
    ];

    $scope.loadSAFs = function() {

        $ionicScrollDelegate.resize();

        if (safLoaded) return;

        $scope.loading = true;

        var query = "exec RL.RLDetalhesProjetosSAF " + globalUserData.usuario.idUsuario;

        fromServer.pullProc(query).success(function(res) {

            $scope.modelosProjetoSAF[0].files = res.filter(x => x.flaPublico === 0);
            if($scope.modelosProjetoSAF[0].files.length === 0){
                $scope.modelosProjetoSAF[0].class = 'semProjeto';
            }

            $scope.modelosProjetoSAF[1].files = res.filter(x => x.flaPublico === 1);
            if($scope.modelosProjetoSAF[1].files.length === 0){
                $scope.modelosProjetoSAF[1].class = 'semProjeto';
            }

            $ionicScrollDelegate.resize();
            safLoaded = true;
            $scope.loading = false;

        }).error(err => console.log(err));

    }

    $scope.formataData = function(dateObj) {
        return dateObj.date.substring(8, 10) + '/' + dateObj.date.substring(5, 7) + '/' + dateObj.date.substring(0, 4);
    }

    $scope.podeDeletarSaf = function(id) {
        return id === globalUserData.usuario.idUsuario;
    }


    //monta propriedade

    $scope.startMontaPropriedade = function() {
        $state.go('montaPropriedade');
    }

}])

.controller('localizaOCtrl', ['$scope', '$stateParams', '$cordovaGeolocation', '$ionicPopup', '$timeout', 'fromServer', '$state', 'mapLayer', 'storeValues', 'linkHelp', 'showDica', '$rootScope', function($scope, $stateParams, $cordovaGeolocation, $ionicPopup, $timeout, fromServer, $state, mapLayer, storeValues, linkHelp, showDica, $rootScope) {

    $scope.iOS = device.platform == 'iOS';
    $scope.selectMunicipio = $scope.iOS ? 'select' : 'input';

    $scope.linkHelp = function(info) {

        $scope.loading = true;

        linkHelp.set('localiza');

        linkHelp.call().success(function(res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    //CAR inquiry
    $scope.data = {};
    $scope.data.car = globalUserData.usuario.idCARDefault;
    $scope.showPopup = function(nocar = false) {
        var sub = nocar ? 'Propriedade n\u00e3o encontrada.</br>Deseja preencher o CAR novamente?' : 'Deseja continuar com o n\u00famero do CAR?';

        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="data.car">',
            title: 'CAR',
            subTitle: sub,
            scope: $scope,
            buttons: [{
                    text: 'N\u00e3o',
                    onTap: function(e) {
                        return false;
                    }
                },
                {
                    text: '<b>Enviar</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (!$scope.data.car) {
                            e.preventDefault();
                        } else {
                            return $scope.data.car;
                        }
                    }
                }
            ]
        });

        myPopup.then(function(res) {
            if (res) $scope.getPolygon(false);
        });
    };

    $scope.showPopup();
    $rootScope.dicas = {index: 1, type: ''};
    showDica.check(1);

    //fitoecologia e municipio
    $scope.municipio = {};
    $scope.listas = {};

    function queryAreas(area) {

        switch (area) {
            case 'municipio':
                var query = 'select idmunicipio as id, nomMunicipio as nm from rl.RLMUNICIPIO';
                break;

            case 'fitoecologia':
                var query = 'select idfitoecologia as id, nomFitoecologia as nm from rl.RLFITOECOLOGIA where idFitoecologia not in (1,2,12)';
                break;
        }

        if ($scope.municipio.nome && area == 'fitoecologia') {
            query = "select f.idfitoecologia as id, f.nomFitoecologia as nm from rl.RLMUNICIPIOFITO as mf join rl.RLMUNICIPIO as m on mf.idMunicipio = m.idMunicipio join rl.RLFITOECOLOGIA as f on mf.idFitoecologia = f.idFitoecologia where m.nomMunicipio = '" + $scope.municipio.nome.nm + "' and f.idfitoecologia not in (1,2,12)";
        }
        //console.log(query);
        return fromServer.pullData(query);
    }

    $scope.getMunicipios = function() {
        $scope.loading = true;
        queryAreas('municipio').success(
            function(data) {
                $scope.listas.cidades = data;
                $scope.getFitoecologias()
            });
    }

    $scope.getFitoecologias = function() {

        if (!$scope.iOS) {
            if (!$scope.municipio.nome) {
                $scope.loading = false;
                return;
            }

            var cidade = $scope.listas.cidades.filter(function(x) {
                return x.nm.split(' ').join('').toLowerCase() == $scope.municipio.nome.nm.split(' ').join('').toLowerCase();
            });

            if (cidade.length !== 1) {
                $scope.listas.fitos = [];
                $scope.loading = false;
                return;
            }
        }

        $scope.loading = true;
        queryAreas('fitoecologia').success(
            function(data) {
                $scope.listas.fitos = data;
                if (!$scope.iOS) $scope.municipio.nome.id = cidade[0].id;
                $scope.loading = false;
            });
    }

    $scope.getMunicipios();


    //GIS Boundaries
    var polyFeature = false;

    $scope.getPolygon = function(munfito = true) {
        //console.log($scope.municipio);
        if (munfito) $scope.data.car = false;
        if (munfito && (!$scope.municipio.fitoecologia || !$scope.municipio.nome)) return;

        $scope.loading = true;

        var geoquery;
        if (munfito) {
            geoquery = "select geom.STEnvelope().ToString() as poly from rl.vRLMunFito_geom where idMunicipio = @mun and idFitoecologia = @fito";
            geoquery = geoquery.replace('@mun', $scope.municipio.nome.id);
            geoquery = geoquery.replace('@fito', $scope.municipio.fitoecologia.id);
        } else {
            geoquery = `select pc.shape.STEnvelope().ToString() as poly, fg.idFitoecologia, fit.nomFitoecologia, fg.idMunicipio, mun.nomMunicipio, fg.idMunicipioFito from rl.rlpropriedadessp pc full join rl.RLMUNICIPIOFITO_GEO fg on fg.idMunicipio = pc.codigoIB full join rl.rlmunicipio mun on mun.idmunicipio = fg.idmunicipio full join rl.rlfitoecologia fit on fit.idfitoecologia = fg.idfitoecologia where pc.CAR = @car and fg.idFitoecologia not in (1,2,12) and fg.geo.STIntersects( geography::STGeomFromText(pc.shape.ToString(),4326) ) = 1`;
            geoquery = geoquery.replace('@car', $scope.data.car);
        }

        fromServer.pullData(geoquery).success(function(poly) {

            if (!munfito && poly.length < 1) {
                $scope.showPopup(true);
                $scope.loading = false;
                return;
            }

            if (!munfito) {
                $scope.municipio.nome = { nm: poly[0].nomMunicipio, id: poly[0].idMunicipio };
                $scope.getFitoecologias();
                $scope.municipio.fitoecologia = { nm: poly[0].nomFitoecologia, id: poly[0].idFitoecologia };
            }

            var layer = munfito ? 'munfito' : 'car';
            var view = munfito ? [$scope.municipio.nome.id, $scope.municipio.fitoecologia.id] : $scope.data.car;

            var mlink = mapLayer.getLink(layer, poly[0].poly, view);
            polyFeature = mlink;

            $scope.coordenadas = polyFeature.getCenter().lat.toFixed(3) + " / " + polyFeature.getCenter().lon.toFixed(3);

            testMap();

            $scope.loading = false;
        }).error(function(err) {
            //console.log(err);
            if (!munfito) $scope.showPopup(true);
            $scope.loading = false;
        })
    }

    //municipio e fito de um ponto
    function getMunFitoPoint() {
        if (!coordenada.lat) return;
        $scope.data.car = false;
        $scope.loading = true;

        function showPointAlert() {
            var alertPopup = $ionicPopup.alert({
                title: 'Este ponto n\u00E3o pertence a nenhuma combina\u00E7\u00E3o Munic\u00EDpio + Fitoecologia cadastrada',
                template: 'Tente uma localiza\u00E7\u00E3o diferente'
            });
        };

        var pointQuery = "exec RL.RLProcuraPontoGeo " + coordenada.lon + " , " + coordenada.lat;

        fromServer.pullData(pointQuery).success(function(res) {
            if (res.length < 1) {
                showPointAlert();
            } else {
                $scope.municipio.nome = { nm: res[0].nomMunicipio, id: res[0].idMunicipio };
                $scope.getFitoecologias();
                $scope.municipio.fitoecologia = { nm: res[0].nomFitoecologia, id: res[0].idFitoecologia };

                $scope.coordenadas = coordenada.lat.toFixed(4) + ' / ' + coordenada.lon.toFixed(4);

                var zoom = map.getZoom();
                var center = new google.maps.LatLng(coordenada.lat, coordenada.lon);
                var mapType = map.getMapTypeId();
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: zoom,
                    center: center,
                    mapTypeId: mapType
                });

                google.maps.event.addListener(map, 'click', function(event) {
                    placeMarker(event.latLng);
                });

                var marker = new google.maps.Marker({
                    position: center,
                    map: map
                });
                deleteMarkers();
                markers.push(marker);
            }
            $scope.loading = false;
        }).error(err => console.log(err));
    }

    //MAP
    var overlay;
    var map;
    var markers = [];
    var coordenada = {};

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: { lat: -21, lng: -50 },
        mapTypeId: 'hybrid'
    });

    function placeMarker(location) {
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
        deleteMarkers();
        markers.push(marker);
        //map.setCenter(location);
        coordenada.lat = location.lat();
        coordenada.lon = location.lng();
    }

    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }

    function deleteMarkers() {
        setMapOnAll(null);
        markers = [];
    }

    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
    });

    function testMap() {

        gMap.prototype = new google.maps.OverlayView();

        function initMap() {

            var bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(polyFeature.latBottomLeft, polyFeature.lonBottomLeft),
                new google.maps.LatLng(polyFeature.latTopRight, polyFeature.lonTopRight));

            var mapDiv = document.getElementById('map');
            var mapDim = { height: mapDiv.offsetHeight, width: mapDiv.offsetWidth };

            var zoom = mapLayer.getBoundsZoomLevel(bounds, mapDim);
            var center = new google.maps.LatLng(polyFeature.getCenter().lat, polyFeature.getCenter().lon);
            var mapType = map.getMapTypeId();
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: zoom,
                center: center,
                mapTypeId: mapType
            });

            google.maps.event.addListener(map, 'click', function(event) {
                placeMarker(event.latLng);
            });
            //map.setZoom(zoom);
            //map.setCenter(center);

            var srcImage = polyFeature.png;
            overlay = new gMap(bounds, srcImage, map);
        };

        initMap();

        function gMap(bounds, image, map) {

            this.bounds_ = bounds;
            this.image_ = image;
            this.map_ = map;

            this.div_ = null;

            this.setMap(map);
        }

        gMap.prototype.onAdd = function() {

            var div = document.createElement('div');
            div.style.borderStyle = 'none';
            div.style.borderWidth = '0px';
            div.style.position = 'absolute';

            var img = document.createElement('img');
            img.src = this.image_;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.position = 'absolute';
            div.appendChild(img);

            this.div_ = div;

            var panes = this.getPanes();
            panes.overlayLayer.appendChild(div);
        };

        gMap.prototype.draw = function() {

            var overlayProjection = this.getProjection();

            var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
            var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

            var div = this.div_;
            div.style.left = sw.x + 'px';
            div.style.top = ne.y + 'px';
            div.style.width = (ne.x - sw.x) + 'px';
            div.style.height = (sw.y - ne.y) + 'px';
        };

        gMap.prototype.onRemove = function() {
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null;
        };

        //google.maps.event.addDomListener(window, 'load', initMap);
        /**/
    }

    //point from map
    $scope.markerFromMap = function() {
        getMunFitoPoint();
    }

    //point from text
    $scope.markerFromText = function(latLonTxt) {
        //cordova.plugins.Keyboard.close();
        $scope.data.car = false;

        function showAlert() {
            var alertPopup = $ionicPopup.alert({
                title: 'Erro de coordenada',
                template: '<span>Coordenadas inseridas incorretamente.</br>Insira as coordenadas em graus decimais, da seguinte forma: </br><strong>latitute / longitude</strong></br></br>Por exemplo:</br><strong>-21.056 / -50.123</strong></span>'
            });
        };

        var rx = /^-?\d+[.,]?\d*\s*\/\s*\-?\d+[.,]?\d*$/;
        if (!rx.test(latLonTxt)) {
            showAlert();
            return;
        }

        try {
            latLonTxt = latLonTxt.split(',').join('.');
            var vals = latLonTxt.split('/');
            coordenada.lat = parseFloat(vals[0]);
            coordenada.lon = parseFloat(vals[1]);
        } catch (err) {
            console.log(err);
            showAlert();
            return;
        }

        getMunFitoPoint();
        var latLng = new google.maps.LatLng(coordenada.lat, coordenada.lon);

        var marker = new google.maps.Marker({
            position: latLng,
            map: map
        });

        deleteMarkers();
        markers.push(marker);
        map.setCenter(latLng);
    }

    //point from gps
    $scope.markerFromGPS = function() {
        $scope.loading = true;
        var GPSoptions = { timeout: 10000, enableHighAccuracy: true };

        $cordovaGeolocation.getCurrentPosition(GPSoptions).then(function(position) {
                coordenada.lat = position.coords.latitude;
                coordenada.lon = position.coords.longitude;

                getMunFitoPoint();
                var latLng = new google.maps.LatLng(coordenada.lat, coordenada.lon);

                var marker = new google.maps.Marker({
                    position: latLng,
                    animation: google.maps.Animation.DROP,
                    map: map
                });

                var infoWindow = new google.maps.InfoWindow({
                    content: "Voc\u00ea est\u00e1 aqui!"
                });

                deleteMarkers();
                markers.push(marker);
                map.setCenter(latLng);
            },
            function(error) {
                $ionicPopup.alert({
                    title: "N\u00e3o foi poss\u00EDvel encontrar sua localiza\u00e7\u00e3o."
                });
                $scope.loading = false;
            });
    }


    //globalize data
    function showAlertaMunFito() {
        var alertPopup = $ionicPopup.alert({
            title: 'Localiza\u00e7\u00e3o indefinida',
            template: 'Preencha os campos <strong>Fitoecologia</strong> e <strong>Munic\u00edpio</strong>.'
        });
    };

    $scope.assignLocation = function() {

        if (!$scope.municipio.fitoecologia || !$scope.municipio.nome) {
            showAlertaMunFito();
        } else {

            $scope.loading = true;

            globalUserData.fitoecologia = $scope.municipio.fitoecologia;
            globalUserData.municipio = $scope.municipio.nome;
            if ($scope.data.car) globalUserData.car = $scope.data.car;

            var query = 'select * from rl.rlmunicipiofito where idmunicipio = ' + globalUserData.municipio.id + ' and idfitoecologia = ' + globalUserData.fitoecologia.id;

            fromServer.pullData(query).success(
                function(data) {
                    globalUserData.munFito = data[0];

                    $scope.loading = false;

                    $state.go('ondePlantarSP');
                })
        }
    }

}])

.controller('ondePlantarSPCtrl', ['$scope', '$stateParams', '$state', 'linkHelp', function($scope, $stateParams, $state, linkHelp) {

    $scope.linkHelp = function(info) {

        $scope.loading = true;

        linkHelp.set('plantar');

        linkHelp.call().success(function(res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    //areas
    $scope.areas = [
        { val: 'ACNP', longo: 'ACNP - \u00C1rea Comum N\u00e3o Protegida', help: 25 }, { val: 'RL', longo: 'RL - Reserva Legal', help: 23 }
        //, { val: '*APP', longo: 'APP - \u00C1rea de Preserva\u00E7\u00e3o Permanente', help: 24 }
    ];

    //wait
    $scope.wait = function(val) {
        globalUserData.finalidade = { id: (val == 'ACNP' ? 2 : 1), nm: val };

        var goTo = (val == 'APP') ? 'biodiversidade' : 'distribuiO';
        goTo = 'distribuiO';

        setTimeout(function() { $state.go('distribuiO'); }, 300);
    }

}])

.controller('distribuiOCtrl', ['$scope', '$stateParams', '$state', 'fromServer', '$ionicPopup', 'storeValues', 'linkHelp', '$rootScope', 'showDica', function($scope, $stateParams, $state, fromServer, $ionicPopup, storeValues, linkHelp, $rootScope, showDica) {

    $scope.linkHelp = function(info) {

        $scope.loading = true;

        linkHelp.set('distribuição');

        linkHelp.call().success(function(res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    $rootScope.dicas = {index: 2, type: ''};
    showDica.check(2);

    var style = {
        'border-width': '2px',
        'border': 'solid',
        'border-color': 'black',
        'background-color': '',
        'opacity': 1
    };

    $scope.wait = function(val) {

        //$scope.loading = true;

        $scope.styles = {};
        $scope.styles[val] = style;

        var query = "select idmodeloplantio as id, nommodelo as nm from rl.rlmodeloplantio where nommodelo = '" + val + "'";

        fromServer.pullData(query).success(
            function(data) {
                globalUserData.modeloPlantio = data[0];

                //$scope.loading = false;               
                setTimeout(function() { $state.go('espCiesCarroChefe'); }, 300);
            })
    }


}])

.controller('espCiesCarroChefeCtrl', ['$scope', '$stateParams', 'fromServer', '$state', '$ionicPopup', '$ionicNavBarDelegate', 'storeValues', 'linkHelp', '$ionicViewSwitcher', '$ionicLoading', '$rootScope', 'showDica', function($scope, $stateParams, fromServer, $state, $ionicPopup, $ionicNavBarDelegate, storeValues, linkHelp, $ionicViewSwitcher, $ionicLoading, $rootScope, showDica) {

    $scope.linkHelp = function(info) {

        $scope.loading = true;

        linkHelp.set('carro-chefe');

        linkHelp.call().success(function(res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    $rootScope.dicas = {index: 3, type: ''};
    showDica.check(3);

    function noCC() {
        var alertPopup = $ionicPopup.alert({
            title: 'Oops',
            template: 'Ainda não há recomendações para a combinação município/fitoecologia escolhida.'
        });
    };

    //cria projeto
    function alteraProjeto(nowCC) {
        var query = "exec rl.RLAtualiza NUM, 'PRJNM', USERID, CAR, MUNFITO, CC, FINALIDADE, MODPLANTIO, null, null;";

        var car = ('car' in globalUserData) ? "'" + globalUserData.car + "'" : 'null';
        var prn = globalUserData.usuario.idUsuario + '_' + globalUserData.finalidade.id + '_' + globalUserData.projectID;

        query = query.replace('NUM', globalUserData.projectID);
        query = query.replace('PRJNM', prn);
        query = query.replace('CAR', car);
        query = query.replace('USERID', globalUserData.usuario.idUsuario);
        query = query.replace('MUNFITO', globalUserData.munFito.idMunicipioFito);
        query = query.replace('CC', nowCC);
        query = query.replace('FINALIDADE', globalUserData.finalidade.id);
        query = query.replace('MODPLANTIO', globalUserData.modeloPlantio.id);
        return fromServer.pullProc(query);
    }

    //gerar combinacoes
    $scope.showGrupo = { mn: 0, mad: 0, nmad: 0 };

    function rearranjo(arrObj) {
        var keys = Object.keys(arrObj[0]);
        var container = {};

        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var arr = [];

            for (var j = 0; j < arrObj.length; j++) {
                arr.push(arrObj[j][k]);
            }

            container[k] = arr;
        }

        var reObj = [];
        var pref = ['c', 'f', 'i'];
        for (var i = 1; i <= 7; i++) {
            reObj.push({});
            for (var j = 0; j < 3; j++) {
                reObj[i - 1][pref[j]] = container[pref[j] + 'Combinacao' + i];
            }

            reObj[i - 1].props = {
                receita: reObj[i - 1].i.pop(),
                idCC: reObj[i - 1].c.pop(),
                allMad: reObj[i - 1].f.pop()
            };

            function getSum(total, num) {
                return total + num;
            }

            if (reObj[i - 1].props.receita != null) {
                reObj[i - 1].props.categoria = (i <= 3 ? 'mn' : (i >= 6 ? 'nmad' : 'mad'));
            }
        }

        for (var i = 0; i < 7; ++i) {
            var lenOb = reObj[i].c.length;
            for (var j = lenOb - 1; j >= 0; --j) {
                var spc = reObj[i].c[j];
                if (spc == "") {
                    reObj[i].c.pop();
                    reObj[i].f.pop();
                    reObj[i].i.pop();
                }
            }

            $scope.showGrupo[reObj[i].props.categoria] += reObj[i].c.length;
        }

        $scope.showGrupo.mn = ($scope.showGrupo.mn > 0) ? '' : 'CCvazio';
        $scope.showGrupo.mad = ($scope.showGrupo.mad > 0) ? '' : 'CCvazio';
        $scope.showGrupo.nmad = ($scope.showGrupo.nmad > 0) ? '' : 'CCvazio';

        return reObj;

    }

    function makeCombinacoes() {
        $scope.loading = true;

        var query = "declare @mf int = MUNFITO; EXEC RL.RLChecaAtualizaCombinacao @mf; EXEC RL.RLLerCombinacoesPortal @mf";

        query = query.replace('MUNFITO', globalUserData.munFito.idMunicipioFito);

        fromServer.pullProc(query).success(
            function(data) {
                if ('SQLSTATE' in data[0] || data.length == 0) {
                    $scope.showGrupo.mn = 'CCvazio';
                    $scope.showGrupo.mad = 'CCvazio';
                    $scope.showGrupo.nmad = 'CCvazio';
                    noCC();
                } else {
                    $scope.combCC = rearranjo(data);
                }
                $scope.loading = false;
            }).error(function(res) {
            console.log(res);
            $scope.loading = false;
        });

    }

    makeCombinacoes();

    //processa dados

    $scope.processCC = function(choice) {

        $scope.loading = true;
        //$ionicLoading.show();

        globalUserData.CCID = Number(choice.props.idCC);
        globalUserData.carroChefe = choice;

        alteraProjeto(globalUserData.CCID).success(function(res) {
            //console.log(res);
            var query = "EXEC RL.RLCalculaCaixaPoupanca @IDR";

            query = query.replace('@IDR', globalUserData.projectID);

            fromServer.pullData(query).success(function(data) {

                $scope.labels = data.map(x => x.numAno % 2 == 0 ? x.numAno : '');
                $scope.data = [data.map(x => x.valPoupanca / 1000),
                    data.map(x => x.valCaixa / 1000)
                ];

                $scope.loading = false;
                //$ionicLoading.hide();
            });

        });

    }

    //payback
    /*
    $scope.labels = [...Array(10).keys()];
    $scope.data = [
      [-4000,-2000, -1000, 2000, 6000, 9000, 14000, 18000, 25000, 30000],
      [-1000, -1000, 1000, 2000, 5000, 8000, 12000, 15000, 20000, 25000]
    ];
    */
    $scope.series = ['Poupan\u00e7a', 'Projeto'];
    $scope.colors = [{
            backgroundColor: "rgba(250,109,33,0)",
            pointBackgroundColor: "rgba(250,109,33,1)",
            pointHoverBackgroundColor: "rgba(250,109,33,0.8)",
            borderColor: "rgba(250,109,33,1)",
            pointBorderColor: '#fff',
            pointHoverBorderColor: "rgba(250,109,33,1)"
        },
        {
            backgroundColor: "rgba(159,204,0, 0)",
            pointBackgroundColor: "rgba(159,204,0, 1)",
            pointHoverBackgroundColor: "rgba(159,204,0, 0.8)",
            borderColor: "rgba(159,204,0, 1)",
            pointBorderColor: '#fff',
            pointHoverBorderColor: "rgba(159,204,0, 1)"
        }
    ];
    $scope.options = {
        legend: { display: true, position: 'bottom' },
        tooltips: { enabled: true },
        title: { text: 'Fluxo de Caixa (valores nominais)', display: true, fontStyle: 'normal', padding: 2 },
        scales: {
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "Acumulado (R$ mil)   ",
                    fontSize: 10
                },
                type: 'linear',
                display: true,
                position: 'left',
                ticks: { min: -25, stepSize: 50 }
            }],
            xAxes: [{
                position: 'bottom',
                display: true,
                ticks: { min: 0, stepSize: 2 },
                scaleLabel: {
                    display: true,
                    labelString: 'Ano',
                    padding: 0
                }
            }]
        }
    };

    $scope.chartHeight = 'auto';
    $scope.screenOrientation = function() {

        $scope.chartOnly = !$scope.chartOnly;

        if ($scope.chartOnly) {
            window.screen.orientation.lock('landscape');
            $ionicNavBarDelegate.showBackButton(false);
            $ionicNavBarDelegate.showBar(false);
            $scope.chartHeight = '100%';
        } else {
            window.screen.orientation.unlock();
            $ionicNavBarDelegate.showBackButton(true);
            $ionicNavBarDelegate.showBar(true);
            $scope.chartHeight = 'auto';
        }

    }

    $scope.$on("$ionicView.leave", function(event, data) {
        window.screen.orientation.unlock();
        $ionicNavBarDelegate.showBackButton(true);
        $ionicNavBarDelegate.showBar(true);
        $scope.chartHeight = 'auto';
    });

    //next state
    function CCAlert() {
        var alertPopup = $ionicPopup.alert({
            title: 'Combina\u00e7\u00e3o Carro Chefe',
            template: 'Escolha uma combina\u00e7\u00e3o para continuar.'
        });
    };

    $scope.checkCC = function() {
        if (!globalUserData.carroChefe) {
            CCAlert();
        } else {
            $ionicViewSwitcher.nextTransition('none');
            $state.go('biodiversidade');
        }

    }


}])

.controller('biodiversidadeCtrl', ['$scope', '$stateParams', '$state', '$ionicPopup', 'fromServer', 'storeValues', 'linkHelp', '$ionicViewSwitcher', '$ionicLoading', '$window', '$rootScope', 'showDica', function($scope, $stateParams, $state, $ionicPopup, fromServer, storeValues, linkHelp, $ionicViewSwitcher, $ionicLoading, $window, $rootScope, showDica) {

    //console.log(globalUserData);

    $scope.linkHelp = function(info) {

        $scope.loading = true;

        if (info == 3) {
            info = 58;
        } else if (info == 4) {
            info = 38;
        } else if (info == 5) {
            info = 40;
        } else if (info == 6) {
            info = 62;
        }

        linkHelp.set('biodiversidade');

        linkHelp.call().success(function(res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    $scope.linkEspecie = function(id) {
        linkHelp.setEsp(id);
    }

    $scope.dica = {};

    $rootScope.dicas = {index: 4, type: ''};
    showDica.check(4);

    var carroChefe;
    $scope.dropMenusBio = { dropped: {} };

    getCaracteristicas();

    //caracteristicas
    function getCaracteristicas() {
        $scope.loading = true;

        var query = "select * from rl.rlcaracteristica where idcaracteristica in (3,4,5,6)";

        fromServer.pullData(query).success(
            function(data) {
                $scope.caracteristicasInteresse = data;
                incluiCarroChefe();
            }).error(function(err) {
            console.log(err);
            $scope.loading = false;
        })

    };

    function getRegras() {
        $scope.loading = true;

        var query = "select * from rl.RLREGRABIO";

        fromServer.pullData(query).success(
            function(data) {
                $scope.regrasBio = data;
                $scope.contaEspecies();
                $scope.loading = false;
            }).error(function(err) {
            console.log(err);
            $scope.loading = false;
        })

    };

    //adiciona carro chefe
    function incluiCarroChefe() {
        $scope.loading = true;
        var nomCientifico = Object.values(globalUserData.carroChefe.c).filter(x => x != '');

        var query = "select idEspecie, nomComum, nomCientifico, 1 as fix  from RL.RLESPECIE where nomCientifico like '%" + nomCientifico.join("%' or nomCientifico like '%") + "%'";

        fromServer.pullData(query).success(
            function(data) {
                carroChefe = data;
                getBio();
                $scope.loading = false;
            }).error(function(err) {
            console.log(err);
            $scope.loading = false;
        })
    }

    //lista biodiversidade
    function getBio() {
        $scope.loading = true;

        var query = "select CE.idCaracteristica, C.nomCaracteristica, EMF.idEspecie, EMF.nomComum, EMF.nomCientifico, 0 as opt from rl.vRLEspecieMunicipioFito AS EMF join rl.RLCARACTERISTICAESPECIE as CE on EMF.idEspecie = CE.idEspecie join rl.RLCARACTERISTICA as C on C.idCaracteristica = CE.idCaracteristica where idMunicipioFito = @IDMF and CE.idCaracteristica not in (0,1,2) order by nomComum";

        query = query.replace('@IDMF', globalUserData.munFito.idMunicipioFito);

        fromServer.pullData(query).success(
            function(data) {

                var CCid = carroChefe.map(x => x.idEspecie);
                var carInt = $scope.caracteristicasInteresse.map(y => y.idCaracteristica);
                var idInt = data.filter(x => carInt.includes(x.idCaracteristica));
                idInt = new Set(idInt.map(x => x.idEspecie));
                idInt = Array.from(idInt);

                $scope.especiesBio = data.map(function(esp) {
                    if (CCid.includes(esp.idEspecie)) {
                        esp.fix = true;
                        esp.opt = true;
                    } else {
                        esp.fix = false;
                        esp.opt = false;
                    }

                    if (idInt.includes(esp.idEspecie)) {
                        esp.outras = false;
                    } else {
                        esp.outras = true;
                    }

                    return esp;
                });

                $scope.uniqueIds = new Set($scope.especiesBio.map(x => x.idEspecie));

                //console.log($scope.especiesBio);
                getRegras();

                $scope.loading = false;
            }).error(function(err) {
            console.log(err);
            $scope.loading = false;
        })
    }


    //marca mesma espécie em múltiplas categorias
    $scope.getOptId = function(esp) {
        $scope.loading = true;
        for (var i = 0; i < $scope.especiesBio.length; ++i) {
            if ($scope.especiesBio[i].idEspecie == esp.idEspecie) {
                $scope.especiesBio[i].opt = esp.opt;
            }
        }
        $scope.contaEspecies();
    }

    //conta especies
    $scope.contador = {};

    $scope.contaEspecies = function() {
        //total
        var count = new Set();
        var lsp = new Set();
        for (var i = 0; i < $scope.especiesBio.length; ++i) {
            if ($scope.especiesBio[i].opt) {
                count.add($scope.especiesBio[i].idEspecie);
                lsp.add($scope.especiesBio[i].nomComum);
            }
        }

        $scope.listaEspecies = Array.from(lsp).join(', ');

        $scope.contador.total = count.size;
        var miss = $scope.regrasBio.filter(x => x.idCaracteristica == 0)[0].numQuantidade - count.size;
        $scope.contador.total_miss = (miss > 0) ? -miss : 0;

        //categorias
        for (var i = 0; i < $scope.regrasBio.length; ++i) {
            var cara = $scope.regrasBio[i];

            if (cara.idCaracteristica == 0) continue;

            $scope.contador[cara.idCaracteristica] = $scope.especiesBio.filter(x => x.idCaracteristica == cara.idCaracteristica && x.opt).length;

            miss = cara.numQuantidade - $scope.contador[cara.idCaracteristica];

            $scope.contador[cara.idCaracteristica + '_miss'] = (miss > 0) ? -miss : 0;
        }

        //outras
        $scope.contador.outras = $scope.especiesBio.filter(x => x.opt && x.outras).length;
        $scope.contador.outras_miss = 0;

        $scope.loading = false;

    }

    //finaliza biodiversidade
    function bioAlert() {
        var alertPopup = $ionicPopup.alert({
            title: 'Ainda faltam esp\u00E9cies!'
        });
    };

    $scope.checkBio = function() {
        //console.log($scope.contador);
        for (var iter in $scope.contador) {

            if (!/_miss/.test(iter)) continue;

            if ($scope.contador[iter] != 0) {
                bioAlert();
                return;
            }
        }

        $scope.loading = true;


        ///////////////////////
        $ionicViewSwitcher.nextTransition('none');
        ///////////////////////


        var sendBio = $scope.especiesBio.filter(x => x.opt);
        globalUserData.idEspeciesBio = new Set(sendBio.map(x => x.idEspecie));

        var query = 'BEGIN TRY insert into rl.RLCOMBINACAODIVERSIDADE (idEspecie, idRecomendacao) values ';

        var append = [];
        for (let i of globalUserData.idEspeciesBio) {
            var val = '(' + i + ',' + globalUserData.projectID + ')';
            append.push(val);
        }

        query += append.join(', ') + ' END TRY BEGIN CATCH SELECT 1 END CATCH';
        //console.log(query);

        fromServer.pullData(query).success(function(res) {
            $state.go('verModelo');
            $scope.loading = false;
        }).error(function(err) { console.log(err); })

    }

    $scope.$watch('especiesBio', function() { return true; }, true);

    /*    
    window.setInterval(function() {
        $scope.$apply();
    }, 1000);
    */

}])

.controller('verModeloCtrl', ['$scope', '$stateParams', 'fromServer', '$state', '$ionicHistory', '$ionicScrollDelegate', '$ionicLoading', 'linkHelp', '$timeout', function($scope, $stateParams, fromServer, $state, $ionicHistory, $ionicScrollDelegate, $ionicLoading, linkHelp, $timeout) {

    $scope.linkHelp = function(info) {

        $scope.loading = true;

        linkHelp.set('Ver desenho modelo');

        linkHelp.call().success(function(res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    void

    function() {
        $scope.loading = true;

        fromServer.getGrid(globalUserData.projectID, globalUserData.modeloPlantio.id).success(function(res) {

            console.log(res);

            $scope.legenda = res.legenda;
            $scope.grid = res.grid;

            $timeout(function() { $ionicScrollDelegate.$getByHandle('frame').zoomTo(-1, true, 0, 0); }, 300);

            $scope.loading = false;

        }).error(err => console.log(err));
    }();

    $scope.dim = Array.from(Array(33), (x, i) => i);

    $scope.finishProject = function() {

        $scope.loading = true;

        var query = "exec rl.RLFinalizaRecomendacao " + globalUserData.projectID + " , " + globalUserData.usuario.idUsuario;

        fromServer.pullProc(query).success(function(res) {

            fromServer.reportData(globalUserData.projectID, $scope.grid, $scope.legenda).success(function(reported) {

                globalUserData.reports = reported;

                //fromServer.sendEmail(globalUserData.usuario.nomUsuario, globalUserData.usuario.email, false, reported).success(function(em) { return; }).error(function(err) { console.log(err); })

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                $scope.loading = false;

                $state.go('exportarModelo');

            }).error(function(err) { console.log(err); })

        }).error(function(err) { console.log(err); })

    }


}])

.controller('exportarModeloCtrl', ['$scope', '$stateParams', '$timeout', '$cordovaSocialSharing', 'linkHelp', 'fromServer', '$ionicPopup', function($scope, $stateParams, $timeout, $cordovaSocialSharing, linkHelp, fromServer, $ionicPopup) {

    function msgAviso(msg) {
        var alertPopup = $ionicPopup.alert({
            title: msg
        });
    };

    $scope.linkHelp = function(info) {

        $scope.loading = true;

        linkHelp.set('compartilhe');

        linkHelp.call().success(function(res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    var url = sqlAdress.server + "files/";
    var pdfUrl = url + globalUserData.reports[0];

    $scope.downPDF = function() {
        cordova.InAppBrowser.open(pdfUrl, '_system', 'location=no');

    };

    $scope.downXLS = function() {
        var xls = url + globalUserData.reports[1];
        cordova.InAppBrowser.open(xls, '_system', 'location=no');
    };


    $scope.share = function(format) {
        var options = {
            message: 'Veja meu projeto de reflorestamento!',
            subject: 'Projeto Rural Legal',
            files: [url + globalUserData.reports[format]]
        }

        var onSuccess = function(result) {
            console.log("Share completed? " + result.completed);
            console.log("Shared to app: " + result.app);
        }

        var onError = function(msg) {
            console.log("Sharing failed with message: " + msg);
        }

        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    }

    $scope.toMyEamil = function() {
        $scope.loading = true;

        fromServer.sendEmail(globalUserData.usuario.nomUsuario, globalUserData.usuario.email, false, globalUserData.reports).success(function(em) {
            msgAviso(em);
            $scope.loading = false;
        }).error(function(err) {
            msgAviso(em);
            $scope.loading = false;
        })
    }

}])

.controller('enciclopediaIndexCtrl', ['$scope', '$stateParams', '$state', 'tabelaEnciclopedia', 'storeValues', 'fromServer', function($scope, $stateParams, $state, tabelaEnciclopedia, storeValues, fromServer) {

    $scope.categorias = {
        viveiros: {
            self: 'viveiros',
            titulo: 'Viveiros',
            icon: 'leaf'
        },
        eMad: {
            self: 'eMad',
            titulo: 'Empresas madeireiras',
            icon: 'social-buffer'
        },
        eNm: {
            self: 'eNm',
            titulo: 'Empresas n\u00E3o madeireiras',
            icon: 'ios-rose'
        },
        especies: {
            self: 'especies',
            titulo: 'Esp\u00e9cies SP',
            icon: 'ios-flower'
        },
        especiesPA: {
            self: 'especiesPA',
            titulo: 'Esp\u00e9cies PA',
            icon: 'ios-nutrition'
        },
        helpApp: {
            self: 'helpApp',
            titulo: 'Ajuda do aplicativo',
            icon: 'help'
        },
        modSucesso: {
            self: 'modSucesso',
            titulo: 'Modelos de sucesso',
            icon: 'checkmark-round',
            style: 'color:#b3b3b3;background-color:#d9d9d9'
        },
        depoimentos: {
            self: 'depoimentos',
            titulo: 'Depoimentos',
            icon: 'android-chat',
            style: 'color:#b3b3b3;background-color:#d9d9d9'
        }
    };

    $scope.processaCategoria = function(cat, press = true) {

        if (['modSucesso', 'depoimentos'].includes($scope.categorias[cat].self)) return;

        $scope.categorias[cat]['style'] = press ? 'background-color:#d9d9d9' : '';

        $scope.loading = true;

        var categoria = tabelaEnciclopedia.set(cat);

        if (storeValues.get('dicasENC') == 'true') {
            var dicasQuery = "select * from rl.RLDICASAPLICATIVO where moduloApp = 'ENC'";

            fromServer.pullData(dicasQuery).success(function(res) {
                globalUserData.dicasENC = res;

                $state.go(categoria.template);
                $scope.loading = false;

            }).error(x => console.log(x));
        } else {
            $state.go(categoria.template);
            $scope.loading = false;
        }
    }


}])

.controller('enciclopediaDadosCtrl', ['$scope', '$stateParams', '$state', 'tabelaEnciclopedia', 'resumoEspecie', 'ajudaTopico', '$ionicPopup', 'fromServer', '$sce', 'storeValues', 'showDica', '$rootScope', function($scope, $stateParams, $state, tabelaEnciclopedia, resumoEspecie, ajudaTopico, $ionicPopup, fromServer, $sce, storeValues, showDica, $rootScope) {

    //console.log(globalUserData);

    $rootScope.dicas = {index: 9, type: 'ENC'};
    showDica.check(9, 'ENC');

    $scope.titulo = tabelaEnciclopedia.get().titulo;
    $scope.search = tabelaEnciclopedia.get().search;
    $scope.searchCol = tabelaEnciclopedia.get().searchCol;
    $scope.omit = !tabelaEnciclopedia.get().omit ? [''] : tabelaEnciclopedia.get().omit;

    var pagina = tabelaEnciclopedia.get().page;
    $scope.searchBox = {};

    function popAlerta() {
        var alertPopup = $ionicPopup.alert({
            title: 'Oops',
            template: 'Nenhum resultado referente à sua busca.'
        });
    };

    function getTabela() {
        $scope.loading = true;

        tabelaEnciclopedia.sPage(pagina);

        tabelaEnciclopedia.chamada().success(function(res) {

            pagina = res.page;

            if (res.data.length > 0) {
                $scope.header = tabelaEnciclopedia.get().header;


                $scope.datalist = Array.from(new Set(res.data.map(x => x[$scope.searchCol])));
                $scope.colNames = Object.keys(res.data[0]).filter(x => !$scope.omit.includes(x));

                if ($scope.colNames.includes('nomCientifico')) {
                    $scope.dados = res.data.map(function(x) {

                        x.nomCientifico = $sce.trustAsHtml(formataNomCientifico(x.nomCientifico));

                        return x;
                    });
                } else {
                    $scope.dados = res.data;
                }

            } else {
                $scope.header = [];
                $scope.dados = [];
                $scope.datalist = [];
                $scope.colNames = [];
                popAlerta();
                $scope.searchValue('');
            }

            $scope.loading = false;

        }).error(err => console.log(err))
    }

    getTabela();


    $scope.pagination = function(pag) {

        switch (pag) {
            case '<<':
                pagina = 0;
                break;
            case '<':
                pagina -= 1;
                break;
            case '>':
                pagina += 1;
                break;
            case '>>':
                pagina = 10000;
                break;
        }

        getTabela();

    }

    $scope.hideCol = function(col) {
        return $scope.omit.includes(col);
    }

    $scope.searchValue = function(val) {
        pagina = 0;
        tabelaEnciclopedia.sSearch(val);
        getTabela();
    }

    $scope.limpaFiltro = function() {
        $scope.searchBox.sValue = '';
        pagina = 0;
        $scope.searchValue('');
    }

    $scope.setSortCol = function(index) {
        var colNm = $scope.colNames[index];

        if (colNm == 'n') return;

        pagina = 0;
        tabelaEnciclopedia.sSort(colNm);
        getTabela();
    }

    $scope.openLink = function(obj) {

        var site = ('desLink' in obj);

        if (site) {
            cordova.InAppBrowser.open('http://' + obj.desLink, '_system', 'location=yes');
        } else {
            $scope.getPaginaDetalhe(obj);
        }

    }

    $scope.showLink = function(data, colName) {
        var helpEsp = $scope.omit.includes('idEspecie') || $scope.omit.includes('idItemHelp');

        var site = /^www/.test(data);

        var notNumber = colName !== 'n';

        return (helpEsp && notNumber) || site;
    }

    function shareTabela(url) {

        var ip = sqlAdress.server + "files/";
        var address = ip + url;

        var options = {
            message: tabelaEnciclopedia.get().titulo,
            subject: 'Informações Rural Legal',
            files: [address]
        }

        var onSuccess = function(result) {
            console.log("Share completed? " + result.completed);
            console.log("Shared to app: " + result.app);
        }

        var onError = function(msg) {
            console.log("Sharing failed with message: " + msg);
        }

        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    }

    $scope.exportaTabela = function(format) {

        var categoria = tabelaEnciclopedia.get();

        var user = globalUserData.login.usuario;
        var topic = categoria.titulo;
        var query = categoria.where.replace('_COL_', categoria.sort) + categoria.and + categoria.sort;
        var head = categoria.header.slice();

        query = query.replace('top(_PAGE_)', '');
        query = query.replace('idItemHelp,', '');
        query = query.replace('E.idEspecie,', '');

        if (categoria.self == 'helpApp') {
            head.push('Definição');
            head.push('Fonte');
        }

        $scope.loading = true;
        fromServer.exportPageEnciclopedia(query, user, topic, head, format).success(function(res) {
            shareTabela(res);
            $scope.loading = false;
        }).error(x => console.log(x));
    }

    $scope.getPaginaDetalhe = function(row) {

        if ($scope.omit == 'idEspecie') {
            var id = row[$scope.omit[0]];
            var idEst = (tabelaEnciclopedia.get().self == 'especies') ? 1 : 2;
            resumoEspecie.set(id, idEst);
            $state.go('enciclopediaEspecie');
        } else {
            ajudaTopico.set(row);
            $state.go('enciclopediaTopico');
        }

    }

}])

.controller('enciclopediaEspecieCtrl', ['$scope', '$stateParams', '$state', 'tabelaEnciclopedia', 'resumoEspecie', '$sce', '$ionicScrollDelegate', 'linkHelp', function($scope, $stateParams, $state, tabelaEnciclopedia, resumoEspecie, $sce, $ionicScrollDelegate, linkHelp) {

    $scope.linkHelp = function(info) {

        $scope.loading = true;

        linkHelp.set('Usos');

        linkHelp.call().success(function(res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    $scope.hide = {};
    $scope.figuras = {};

    function checkHide(esp) {

        $scope.hide.refs = esp.referencia.length <= 0;

        $scope.hide.info = esp.info.filter(x => !!x).length === 0;

        $scope.hide.links = (esp.links.length === 0);
        if (!$scope.hide.links) $scope.hide.links = esp.links[0] === '';

        if (esp.figuraEspecie.length > 0) {

            $scope.hide.plant = esp.figuraEspecie.filter(x => x.idTipoFigura == 1).length === 0;

            if (!$scope.hide.plant) {
                $scope.figuras.plant = esp.figuraEspecie.filter(x => x.idTipoFigura == 1)[0];
            }

            $scope.hide.wood = esp.figuraEspecie.filter(x => x.idTipoFigura == 2).length === 0;

            if (!$scope.hide.wood) {
                $scope.figuras.wood = esp.figuraEspecie.filter(x => x.idTipoFigura == 2)[0];
            }

            $scope.hide.produto = esp.figuraEspecie.filter(x => x.idTipoFigura == 5).length === 0;

            if (!$scope.hide.produto) {
                $scope.figuras.produto = esp.figuraEspecie.filter(x => x.idTipoFigura == 5);
            }

        } else {
            $scope.hide.plant = true;
            $scope.hide.wood = true;
            $scope.hide.produto = true;
        }

        //console.log($scope.hide);

    }

    function puxaResumo() {
        $scope.loading = true;
        resumoEspecie.get().success(function(res) {
            //console.log(res);

            $scope.relatorio = res;

            $scope.relatorio.info = Object.keys(res.info).map(x => res.info[x]);

            $scope.latin = $sce.trustAsHtml(formataNomCientifico(res.nomes.nomCientifico));

            checkHide($scope.relatorio);

            //console.log($scope.relatorio);

            $scope.loading = false;
        }).error(x => console.log(x))
    }

    puxaResumo();

    $scope.refClick = false;
    $scope.mostraReferencias = function() {
        $scope.loading = true;
        $scope.refClick = !$scope.refClick;
        $ionicScrollDelegate.resize();
        $scope.loading = false;
    }

    $scope.mostraTopicoCaracteristica = function(item) {
        var bool = item === null || item === '';
        return !bool;
    }

    $scope.abreLink = function(link) {
        cordova.InAppBrowser.open(link, '_system', 'location=no');
    }

    $scope.$watch('refClick', function() { return true; }, true);

}])

.controller('enciclopediaTopicoCtrl', ['$scope', '$stateParams', '$state', 'tabelaEnciclopedia', 'ajudaTopico', '$sce', function($scope, $stateParams, $state, tabelaEnciclopedia, ajudaTopico, $sce) {

    $scope.info = ajudaTopico.get();

    $scope.info.desDefinicao = $sce.trustAsHtml($scope.info.desDefinicao);

}])

.controller('safHorizonteCtrl', ['$scope', '$stateParams', '$state', 'ajudaTopico', '$ionicPopup', 'storeValues', 'linkHelp', 'showDica', '$rootScope', function($scope, $stateParams, $state, ajudaTopico, $ionicPopup, storeValues, linkHelp,  showDica, $rootScope) {

    $rootScope.dicas = {index: 5, type: 'SAF'};
    showDica.check(5, 'SAF');

    $scope.linkHelp = function (info) {

        $scope.loading = true;

        linkHelp.set('SAF');

        linkHelp.call().success(function (res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    //n == meses
    $scope.intervalosTempo = [
        { n: 6, nom: 'semestres', view: 'Semestre' },
        { n: 12, nom: 'anos', view: 'Ano' }
    ];

    $scope.planoTempo = { horizonte: 20, intervalo: $scope.intervalosTempo[0] };

    var HPlimites = [1, 30]; //anos

    function missingTime(tm, hmin, hmax) {

        msg = (tm == 'horizonte') ? 'Escolha um horizonte de planejamento entre ' + hmin + ' e ' + hmax + ' ' + $scope.planoTempo.intervalo.nom : 'Escolha um intervalo de tempo para o planejamento das intervenções';

        var alertPopup = $ionicPopup.alert({
            title: 'Oops',
            template: msg
        });
    };

    $scope.setTimes = function() {

        HPmin = HPlimites[0] / ($scope.planoTempo.intervalo.n / 12);
        HPmax = HPlimites[1] / ($scope.planoTempo.intervalo.n / 12);

        if (!($scope.planoTempo.horizonte >= HPmin && $scope.planoTempo.horizonte <= HPmax)) {
            missingTime('horizonte', HPmin, HPmax);
            return;
        } else if (!('intervalo' in $scope.planoTempo)) {
            missingTime('intervalo', HPmin, HPmax);
            return;
        }

        globalUserData.SAFTempo = $scope.planoTempo;
        $state.go('selecionaEspSAF');
    }

}])

.controller('selecionaEspSAFCtrl', ['$scope', '$stateParams', '$state', 'ajudaTopico', '$interval', 'fromServer', '$ionicPopup', 'storeValues', '$sce', '$ionicActionSheet', 'linkHelp', 'backButtonSet', 'showDica', '$rootScope', function($scope, $stateParams, $state, ajudaTopico, $interval, fromServer, $ionicPopup, storeValues, $sce, $ionicActionSheet, linkHelp, backButtonSet,  showDica, $rootScope) {

    $rootScope.dicas = {index: 6, type: 'SAF'};
    showDica.check(6, 'SAF');

    $scope.$on("$ionicView.enter", function(event, data) {
        backButtonSet.set();        
    });

    $scope.$on("$ionicView.leave", function(event, data) {
        backButtonSet.restore();     
    });

    //links
    $scope.linkEspecie = function(id) {
        linkHelp.setEsp(id, idEst = 2);
    }

    //global
    $scope.showCalendario = false;
    $scope.onlyCalendario = false;
    var screenPos = screen.orientation.type;
    $scope.planoTempo = {
        intervalo: globalUserData.SAFTempo.intervalo.view,
        meses: globalUserData.SAFTempo.intervalo.n,
        horizonte: Array.from(Array(globalUserData.SAFTempo.horizonte).keys()),
        agora: 0
    }
    $scope.monitoraMenus = {
        widLeft: '100vw',
        widRight: '50vw'
    };
    $scope.opcoesFiltro = {
        nomCientifico: { show: false, nom: 'Nome científico' },
        ordenaNomCientifico: {show: false, nom: 'Ordenar por nome científico'},
        baixo: { show: true, nom: 'Est. baixo', idCaracteristica: 14 },
        medio: { show: true, nom: 'Est. médio', idCaracteristica: 13 },
        alto: { show: true, nom: 'Est. alto', idCaracteristica: 12 },
        emergente: { show: true, nom: 'Est. emergente', idCaracteristica: 11 }
    }
    $scope.espOrder = 'nomComum';

    $scope.alteraOpcaoFiltro = function(key, val) {
        //$scope.opcoesFiltro[key].show = !$scope.opcoesFiltro[key].show;

        if (key == 'ordenaNomCientifico') {

            if (val.show) {
                $scope.espOrder = 'nomCientifico';
            } else {
                $scope.espOrder = 'nomComum';
            }

            $scope.ordenaEspecies();
        }
    }

    $scope.ordenaEspecies = function(){
        $scope.especies.sort(function(a,b) {
            return a[$scope.espOrder].localeCompare(b[$scope.espOrder]);
        });
    }

    $scope.formataNomCientifico = function(nom) {
        return $sce.trustAsHtml(formataNomCientifico(nom, false));
    };

    $scope.setAgora = function(index) {
        $scope.planoTempo.agora = index;
    }

    $scope.corBotaoAgora = function(index) {
        if ($scope.planoTempo.agora === index) {
            return { "background-color": '#d0e1e1' };
        }
    }

    $scope.corSelecionada = function(sp) {

        var cor;

        if (sp.CicloMaximo * 12 / $scope.planoTempo.meses <= 1) {
            cor = 'red';
        } else {
            cor = sp.periodos.includes($scope.planoTempo.agora) ? 'red' : 'grey';
        }

        return cor;

    }

    function dataAlert(info) {
        var alertPopup = $ionicPopup.alert({
            title: info
        });
    }

    //dados banco
    function getEspecies() {

        $scope.loading = true;

        var query = "select * from rl.vRLEspeciesPA order by nomComum ASC";

        fromServer.pullData(query).success(
            function(res) {

                $scope.especies = res.map(
                    function(x) {
                        x.selected = {};
                        x.periodos = [];
                        return x;
                    }
                );

                $scope.ordenaEspecies();

                //console.log($scope.especies);
                $scope.loading = false;
            }
        ).error(err => console.log(err));

    }

    getEspecies();


    //filtros ng-repeat
    $scope.nomFiltro = '';
    $scope.filtroEspecie = function(select, filtro = null) {
        return function(esp) {

            var idCarac = [];
            for (var i in $scope.opcoesFiltro) {
                if (i == 'nomCientifico') continue;

                if ($scope.opcoesFiltro[i].show) {
                    idCarac.push($scope.opcoesFiltro[i].idCaracteristica);
                }
            }

            var includeCarac = idCarac.includes(esp.idCaracteristica);

            var out = (!(!esp.selected[$scope.planoTempo.agora]) === select);

            out = out && includeCarac;

            if (!select) {

                var regex = new RegExp(filtro, 'i');

                if ($scope.opcoesFiltro.nomCientifico.show) {
                    out = out && regex.test(esp.nomCientifico);
                } else {
                    out = out && regex.test(esp.nomComum);
                }

            }

            return out;
        }
    }

    $scope.filtroCalendario = function(sp) {
        return sp.periodos.length > 0;
    }

    $scope.showSeta = function(sp, index) {
        return sp.selected[index];
    }

    $scope.calculaSeta = function(esp, index) {

        if (esp.periodos.length == 0) {
            return "0,0 0,0 0,0";
        }

        var ciclo = esp.CicloMaximo * 12 / $scope.planoTempo.meses;

        ciclo = (ciclo < 1) ? 1 : ciclo;

        var seta = "0,23 30,23 30,30 50,15 30,0 30,7 0,7";
        var reta = "0,23 50,23 50,7 0,7";

        var anoColheita = esp.periodos.includes(index + 1 - ciclo);

        return (anoColheita ? seta : reta);

    }


    //funções de seleção
    $scope.selecionaEspecie = function(esp) {

        $scope.loading = true;

        esp.selected[$scope.planoTempo.agora] = true;
        esp.periodos = esp.periodos.filter(x => (x < $scope.planoTempo.agora));

        var ciclo = esp.CicloMaximo * 12 / $scope.planoTempo.meses;

        var t = $scope.planoTempo.agora;
        while (t <= $scope.planoTempo.horizonte.slice(-1)) {
            esp.selected[t] = true;
            if ((t - $scope.planoTempo.agora) % ciclo == 0 || ciclo <= 1) {
                esp.periodos.push(t);
            }
            ++t;
        }

        $scope.loading = false;
        //console.log(esp);
    }

    $scope.deselecionaEspecie = function(esp) {

        if (!esp.periodos.includes($scope.planoTempo.agora)) {
            dataAlert("Espécies podem ser removidas apenas nos períodos em que são plantadas, sendo automaticamente removidas dos períodos subsequentes.");
            return;
        }

        $scope.loading = true;

        //esp.selected[$scope.planoTempo.agora] = false;

        for (var i in esp.selected) {
            if (parseInt(i) < $scope.planoTempo.agora) continue;
            esp.selected[i] = false;
        }

        /*var ciclo = esp.CicloMaximo * 12 / $scope.planoTempo.meses;

        if (ciclo <= 1) {
            $scope.loading = false;
            return;
        }

        for (var t = 1; t < ciclo; ++t) {
            esp.selected[$scope.planoTempo.agora + t] = false;
            if (t >= $scope.planoTempo.horizonte.slice(-1)) break;
        }*/

        esp.periodos = esp.periodos.filter(x => (x < $scope.planoTempo.agora /*|| x >= ($scope.planoTempo.agora + ciclo)*/ ));

        $scope.loading = false;
        //console.log($scope.planoTempo);
        //console.log(esp);

    }


    //input ciclo pelo usuário
    $scope.userInput = {}
    $scope.checkCiclo = function(especie) {

        if (especie.periodos.length > 0) {
            $scope.selecionaEspecie(especie);
            return;
        }

        $scope.userInput.ciclo = especie.CicloMaximo * 12 / $scope.planoTempo.meses;

        var myPopup = $ionicPopup.show({
            template: 'Informe o ciclo de vida do(a) <b>' + especie.nomComum + '</b> (' + formataNomCientifico(especie.nomCientifico) + ') em <b>' + $scope.planoTempo.intervalo.toLowerCase() + 's</b>.<br><span ng-show="userInput.erro" style="color:red">O ciclo do(a) ' + especie.nomComum + ' não deve ser inferior a ' + especie.CicloMinimo * 12 / $scope.planoTempo.meses + ' ' + $scope.planoTempo.intervalo.toLowerCase() + '(s).</span><br><input type="number" ng-model="userInput.ciclo" step="0.01">',
            title: 'Ciclo máximo',
            scope: $scope,
            buttons: [{
                    text: 'Cancela',
                    type: 'button-stable',
                    onTap: function() { return; }
                },
                {
                    text: '<b>OK</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (!$scope.userInput.ciclo) {
                            $scope.userInput.erro = true;
                            e.preventDefault();
                            return;
                        }

                        var cicloAnos = $scope.userInput.ciclo * $scope.planoTempo.meses / 12;

                        if (cicloAnos < especie.CicloMinimo || cicloAnos <= 0) {
                            $scope.userInput.erro = true;
                            e.preventDefault();
                        } else {
                            especie.CicloMaximo = cicloAnos;
                            $scope.userInput = {};
                            $scope.selecionaEspecie(especie);
                        }
                    }
                }
            ]
        });
    };


    //calendário

    $scope.calculaCiclos = function(esp) {

        var ciclo = esp.CicloMaximo * 12 / $scope.planoTempo.meses;
        var rotacoes = esp.periodos.length;

        if (ciclo < 1) {
            rotacoes /= ciclo;
            rotacoes = '*' + Math.floor(rotacoes);
            $scope.cicloCurto = true;
        }

        return rotacoes;

    }


    $scope.expandeTela = function() {
        if ($scope.showCalendario) {
            screen.orientation.unlock()
            $scope.showCalendario = false;
            $scope.monitoraMenus.widLeft = "100vw";
        } else {
            screen.orientation.lock('landscape');
            $scope.showCalendario = true;
            $scope.monitoraMenus.widLeft = "50vw";
        }
    }

    $scope.expandeCronograma = function() {

        if ($scope.onlyCalendario) {
            //screen.orientation.unlock();
            $scope.onlyCalendario = false;
            $scope.monitoraMenus.widRight = '50vw';
        } else {
            screen.orientation.lock('landscape');
            $scope.onlyCalendario = true;
            $scope.monitoraMenus.widRight = '100vw';
        }
    }

    $scope.$on("$ionicView.leave", function(event, data) {
        screen.orientation.unlock()
        $scope.showCalendario = false;
        $scope.onlyCalendario = false;
        $scope.monitoraMenus.widLeft = "100vw";
    });


    //monitora posição da tela e mudanças na seleção de espécies
    var monitoraTela = function() {
        if (screen.orientation.type == screenPos) {
            return;
        }
        screenPos = screen.orientation.type;
        $scope.showCalendario = /landscape/.test(screenPos);
        $scope.expandeTela();
    }

    $scope.$watch('especies', function() { return true; }, true);
    //$interval(monitoraTela, 500);


    //troca view
    $scope.salvaEspecies = function() {
        //console.log($scope.especies);

        $scope.loading = true;

        var spp = [];
        for (var i = 0; i < $scope.especies.length; ++i) {
            var p = $scope.especies[i].periodos.length;

            if (p > 0) {
                spp.push($scope.especies[i]);
            }
        }

        if (spp.length == 0) {
            dataAlert('Selecione espécies para avançar.');
            $scope.loading = false;
            return;
        }

        globalUserData.especiesSAF = spp;
        $scope.loading = false;

        $state.go('safEspaco');
    }

}])

.controller('safEspacoCtrl', ['$scope', '$stateParams', '$state', 'ajudaTopico', '$interval', 'fromServer', '$ionicPopup', 'storeValues', 'linkHelp', 'showDica', '$rootScope', function($scope, $stateParams, $state, ajudaTopico, $interval, fromServer, $ionicPopup, storeValues, linkHelp, showDica, $rootScope) {

    $rootScope.dicas = {index: 7, type: 'SAF'};
    showDica.check(7, 'SAF');

    $scope.linkHelp = function (info) {

        $scope.loading = true;

        linkHelp.set('SAF');

        linkHelp.call().success(function (res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    $scope.espacamento = { linhas: 1, plantas: 1, croquiLinhas: 5, croquiPlantas: 10 };

    var minVals = { ml: 0.5, mp: 0.5, nl: 1, np: 1 };

    function missingDim(dim, min) {

        var msg = "Preencha um <b>" + dim + "</b> de pelo menos <b>" + min + "</b> metro(s)";

        var alertPopup = $ionicPopup.alert({
            title: 'Oops',
            template: msg
        });
    };

    $scope.setDims = function() {

        if (!('linhas' in $scope.espacamento) || $scope.espacamento.linhas < minVals.ml) {

            missingDim('espaço mínimo entre linhas', minVals.ml);
            return;

        } else if (!('plantas' in $scope.espacamento) || $scope.espacamento.plantas < minVals.mp) {

            missingDim('espaço mínimo entre plantas', minVals.mp);
            return;

        } else if (!('croquiLinhas' in $scope.espacamento) || $scope.espacamento.croquiLinhas < minVals.nl) {

            missingDim('número de linhas no croqui', minVals.nl);
            return;

        } else if (!('croquiPlantas' in $scope.espacamento) || $scope.espacamento.croquiPlantas < minVals.np) {

            missingDim('número de plantas no croqui', minVals.np);
            return;

        }

        $scope.loading = true;

        globalUserData.SAFEspaco = $scope.espacamento;
        $state.go('montaCroqui');

        $scope.loading = false;

    }

}])

.controller('montaCroquiCtrl', ['$scope', '$stateParams', '$state', 'ajudaTopico', '$interval', 'fromServer', '$ionicPopup', '$sce', 'storeValues', '$ionicViewSwitcher', 'backButtonSet', '$timeout', '$ionicHistory', 'showDica', '$rootScope', function($scope, $stateParams, $state, ajudaTopico, $interval, fromServer, $ionicPopup, $sce, storeValues, $ionicViewSwitcher, backButtonSet, $timeout, $ionicHistory, showDica, $rootScope) {

    $rootScope.dicas = {index: 8, type: 'SAF'};
    showDica.check(8, 'SAF');

    $scope.$on("$ionicView.enter", function(event, data) {
        //screen.orientation.lock('landscape');
        $timeout(() => backButtonSet.set() , 300);        
    });

    $scope.$on("$ionicView.leave", function(event, data) {
        //screen.orientation.unlock();
        backButtonSet.restore();     
    });

    //global
    var croquiCols = globalColorList;

    $scope.formataNomCientifico = function(nom) {
        if(!nom) return;
        return $sce.trustAsHtml(formataNomCientifico(nom, true));
    };

    $scope.periodo = 0;
    $scope.setPeriodo = function(ind) {
        $scope.periodo = ind;
        $scope.selectedEspecieCor = {};
    }

    $scope.corBotaoAgora = function(index) {
        if ($scope.periodo === index) {
            return { "background-color": '#d0e1e1' };
        }
    }

    $scope.SAF = {
        tempo: globalUserData.SAFTempo,
        espaco: globalUserData.SAFEspaco,
        especies: globalUserData.especiesSAF,
        horizonte: Array.from(Array(globalUserData.SAFTempo.horizonte).keys())
    }

    function defineDimensions() {

        $scope.SAF.linhas = [];
        for (var i = 0; i < globalUserData.SAFEspaco.croquiLinhas; ++i) {
            var obj = { index: i, servico: false };
            $scope.SAF.linhas.push(obj);
        }

        $scope.SAF.plantas = [];
        for (var j = 0; j < globalUserData.SAFEspaco.croquiPlantas; ++j) {
            var obj = { index: j };
            $scope.SAF.plantas.push(obj);
        }

        for (var k = 0; k < $scope.SAF.especies.length; ++k) {
            $scope.SAF.especies[k]['cor'] = croquiCols[k];
        }

    }
    defineDimensions();

    function popAlerta(msg) {
        var alertPopup = $ionicPopup.alert({
            title: 'Oops',
            template: msg
        });
    };

    //formatação e visualização
    $scope.corServico = function(linha) {

        if (!linha.servico) return;

        var style = { 'background-color': '#ccffcc' };
        return style;

    }

    $scope.selectedEspecieCor = {};
    $scope.especie = {};
    $scope.selectEspecie = function(index, id) {
        $scope.especie[$scope.periodo] = $scope.SAF.especies.filter(x => x.idEspecie == id)[0];

        //setDistancia();

        $scope.selectedEspecieCor = {};
        $scope.selectedEspecieCor[index] = " #d0e1e1";

    }

    $scope.temIcone = function(hash){
        return hash.length > 100;
    }

    //espaçamento
    $scope.distEsp = {};

    /*function setDistancia() {

        if (('espacoLinha' in $scope.especie[$scope.periodo]) && ('espacoPlanta' in $scope.especie[$scope.periodo])) {
            return;
        }

        cordova.plugins.Keyboard.disableScroll(false);

        var myPopup = $ionicPopup.show({
            template: 'Informe o espaçamento entre os individuos da espécie<input type="number" ng-model="distEsp.linha" placeholder="entre linhas (metros)" step="0.1"><br><input type="number" ng-model="distEsp.planta" placeholder="dentro da linha (metros)" step="0.1"><br><span ng-show="distEsp.errMsg" style="color:red">{{distEsp.errMsg}}</span>',
            title: 'Espaçamento ' + $scope.especie[$scope.periodo].nomComum,
            scope: $scope,
            buttons: [{
                    text: 'Cancela',
                    type: 'button-stable',
                    onTap: function() {
                        $scope.distEsp = {};
                        delete $scope.especie[$scope.periodo];
                        cordova.plugins.Keyboard.disableScroll(true);
                    }
                },
                {
                    text: '<b>OK</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        delete $scope.distEsp.errMsg;
                        if ($scope.distEsp.linha === undefined || $scope.distEsp.planta === undefined) {

                            $scope.distEsp.errMsg = "informe ambos os espaçamentos.";
                            e.preventDefault();

                        } else if ($scope.distEsp.linha < $scope.SAF.espaco.linhas) {

                            $scope.distEsp.errMsg = "o espaçamento entre linhas deve ser de pelo menos " + $scope.SAF.espaco.linhas + "m";
                            e.preventDefault();

                        } else if ($scope.distEsp.planta < $scope.SAF.espaco.plantas) {

                            $scope.distEsp.errMsg = "o espaçamento entre plantas deve ser de pelo menos " + $scope.SAF.espaco.plantas + "m";
                            e.preventDefault();

                        } else if ($scope.distEsp.linha % $scope.SAF.espaco.linhas != 0) {

                            $scope.distEsp.errMsg = "o espaçamento entre linhas deve ser múltiplo de " + $scope.SAF.espaco.linhas + "m";
                            e.preventDefault();

                        } else if ($scope.distEsp.planta % $scope.SAF.espaco.plantas != 0) {

                            $scope.distEsp.errMsg = "o espaçamento entre plantas deve ser múltiplo de " + $scope.SAF.espaco.plantas + "m";
                            e.preventDefault();

                        } else {

                            $scope.especie[$scope.periodo].espacoLinha = $scope.distEsp.linha;
                            $scope.especie[$scope.periodo].espacoPlanta = $scope.distEsp.planta;
                            $scope.distEsp = {};

                            cordova.plugins.Keyboard.disableScroll(true);

                        }
                    }
                }
            ]
        });
    };*/

    //preenchimento croqui
    $scope.desenhoCroqui = {};
    $scope.fillCova = function(lin, pla) {

        if (!($scope.periodo in $scope.especie) && !$scope.remMode.active) return;

        var cova = lin + '-' + pla;

        //confere cova
        var covaFilled = (cova in $scope.desenhoCroqui);

        if (!covaFilled) {
            $scope.desenhoCroqui[cova] = {};
        }

        //confere periodo para a cova
        var periodoCova = ($scope.periodo in $scope.desenhoCroqui[cova]);

        if (!periodoCova) {
            $scope.desenhoCroqui[cova][$scope.periodo] = {};
        }

        var especiePeriodoCova = ('id' in $scope.desenhoCroqui[cova][$scope.periodo]);

        //remove indivíduos
        if ($scope.remMode.active) {

            if (especiePeriodoCova) {
                var id = $scope.desenhoCroqui[cova][$scope.periodo].id;
                var planted = $scope.desenhoCroqui[cova][$scope.periodo].plantio;

                if($scope.remMode.cultura){

                    for(var cv in $scope.desenhoCroqui){
                        for(var pr in $scope.desenhoCroqui[cv]){
                            if($scope.desenhoCroqui[cv][pr].id === id){
                                delete $scope.desenhoCroqui[cv][pr];
                            }
                        }
                    }
                    
                }else{

                    for (var t = $scope.periodo; t < $scope.SAF.tempo.horizonte; ++t) {
                        var tCova = (t in $scope.desenhoCroqui[cova]);
                        if (!tCova) continue;

                        var ePerCov = ('id' in $scope.desenhoCroqui[cova][t]);
                        if (!ePerCov) continue;

                        var msmIndiv = ($scope.desenhoCroqui[cova][t].id == id); //&& ($scope.desenhoCroqui[cova][t].plantio == planted);

                        if (msmIndiv) {
                            delete $scope.desenhoCroqui[cova][t];
                        }
                    }

                }

            } else {
                delete $scope.desenhoCroqui[cova][$scope.periodo];
            }

            $scope.areaCopaPeriodo = calculaAreaPorEstrato();
            return;
        }

        if (especiePeriodoCova) return;

        var intervaloPlantioPlanta = 1;
        //$scope.especie[$scope.periodo].espacoPlanta / $scope.SAF.espaco.plantas;

        var intervaloPlantioLinha = 1;
        //$scope.especie[$scope.periodo].espacoLinha / $scope.SAF.espaco.linhas;

        /*var arredores = consultaVizinhos(lin, pla, intervaloPlantioLinha, intervaloPlantioPlanta, $scope.periodo);

        if (arredores) {
            popAlerta("Indivíduos da mesma espécie muito póximos");
            delete $scope.desenhoCroqui[cova][$scope.periodo];
            return;
        }*/

        $scope.loading = true;

        var periodosOcorrencia = Object.keys($scope.especie[$scope.periodo].selected).map(x => Number(x)).filter(y => (y >= $scope.periodo && $scope.especie[$scope.periodo].selected[y]));

        /* loopCova: for (var i = pla; i < $scope.SAF.espaco.croquiPlantas; i += intervaloPlantioPlanta) { */

                var i = pla;
                loopT: for (var t = 0; t < periodosOcorrencia.length; ++t) {

                    var prd = periodosOcorrencia[t];

                    //arredores = consultaVizinhos(lin, i, intervaloPlantioLinha, intervaloPlantioPlanta, prd);

                    //if (arredores) continue loopCova;

                    cova = lin + '-' + i;

                    //confere cova
                    covaFilled = (cova in $scope.desenhoCroqui);

                    if (!covaFilled) {
                        $scope.desenhoCroqui[cova] = {};
                    }

                    //confere periodo para a cova
                    periodoCova = (prd in $scope.desenhoCroqui[cova]);

                    if (!periodoCova) {
                        $scope.desenhoCroqui[cova][prd] = {}
                    }

                    especiePeriodoCova = ('id' in $scope.desenhoCroqui[cova][prd]);
                    
                    if (especiePeriodoCova) {

                        if($scope.desenhoCroqui[cova][prd].id !== $scope.especie[$scope.periodo].idEspecie){
                            var lastPlantio = $scope.especie[$scope.periodo].periodos.filter(x => x <= prd).pop();                

                            for(var rp = lastPlantio; rp < prd; ++rp){
                                delete $scope.desenhoCroqui[cova][rp];
                            }

                            var prdPlantios = $scope.especie[$scope.periodo].periodos.filter(x => (x >= $scope.periodo && x < prd));

                            var nCiclos = prdPlantios.length;

                            if($scope.especie[$scope.periodo].CicloMaximo <= 1){
                                var msg = (nCiclos > 0) 
                                
                                ? '<b>' + Math.floor(nCiclos / ($scope.especie[$scope.periodo].CicloMaximo * 12 / $scope.SAF.tempo.intervalo.n)) + ' ciclo(s)</b> de '+$scope.especie[$scope.periodo].nomComum+' inserido(s) até o '+$scope.SAF.tempo.intervalo.view.toLowerCase()+' </b>'+(prdPlantios.pop())+'</b>.'

                                : 'Nenhum ciclo de '+$scope.especie[$scope.periodo].nomComum+' inserido.';
                            }else{
                                var msg = (nCiclos > 1) 
                                
                                ? '<b>' + (nCiclos-1) + ' ciclo(s)</b> de '+$scope.especie[$scope.periodo].nomComum+' inserido(s) até o ' +$scope.SAF.tempo.intervalo.view.toLowerCase()+' <b>'+(prdPlantios.pop()-1)+'</b>.' 
                                
                                : 'Nenhum ciclo de '+$scope.especie[$scope.periodo].nomComum+' inserido.';
                            }

                            msg += ' Outra espécie ocupa este espaço no '+$scope.SAF.tempo.intervalo.view.toLowerCase()+' <b>'+(prd)+'</b>.';

                            popAlerta(msg);
                        }

                        break loopT; //continue loopCova;
                    }

                    $scope.desenhoCroqui[cova][prd].id = $scope.especie[$scope.periodo].idEspecie;
                    $scope.desenhoCroqui[cova][prd].cor = $scope.especie[$scope.periodo].cor;
                    $scope.desenhoCroqui[cova][prd].plantio = $scope.especie[$scope.periodo].periodos.filter(x => x <= prd).reverse()[0];
                    $scope.desenhoCroqui[cova][prd].idade = (prd - $scope.desenhoCroqui[cova][prd].plantio) * $scope.SAF.tempo.intervalo.n;
                    $scope.desenhoCroqui[cova][prd].estrato = $scope.especie[$scope.periodo].idCaracteristica;
                    $scope.desenhoCroqui[cova][prd].areaCopa = $scope.especie[$scope.periodo].crescCopaMensal * ($scope.desenhoCroqui[cova][prd].idade + $scope.SAF.tempo.intervalo.n);

                }
            //}
            //console.log($scope.desenhoCroqui);
        $scope.areaCopaPeriodo = calculaAreaPorEstrato();
        $scope.loading = false;
    }

    $scope.drawCova = function(lin, pla) {

        var cova = lin + '-' + pla;

        var checkCova = (cova in $scope.desenhoCroqui);

        if (!checkCova) return;

        var checkPeriodo = ($scope.periodo in $scope.desenhoCroqui[cova]);

        if (!checkPeriodo) return;

        var especie = $scope.SAF.especies.filter(x => x.idEspecie === $scope.desenhoCroqui[cova][$scope.periodo].id)[0];

        if(especie.hashFigura.length < 100){
            var tag = '<i class="icon ion-leaf" style="color:_COR_"></i>';
        }else{
            var tag = '<div style="border: 2px solid _COR_;padding:2px;display:flex;align-content:center"><img src="'+especie.hashFigura+'" alt="" style="max-height:28px" /></div>';
        }

        tag = tag.replace('_COR_', $scope.desenhoCroqui[cova][$scope.periodo].cor);

        return $sce.trustAsHtml(tag);

    }

    /*function consultaVizinhos(linha, planta, dstLinha, dstPlanta, periodo) {
        var temVizinho = false;

        for (var el = linha - dstLinha + 1; el < linha + dstLinha; ++el) {

            if (el >= $scope.SAF.espaco.croquiLinhas || temVizinho) break;

            for (var ep = planta - dstPlanta + 1; ep < planta + dstPlanta; ++ep) {

                if (ep < 0 || el < 0) continue;
                if (ep >= $scope.SAF.espaco.croquiPlantas) break;

                var cova = el + '-' + ep;

                var cvFull = (cova in $scope.desenhoCroqui);
                if (!cvFull) continue;

                var pCv = (periodo in $scope.desenhoCroqui[cova]);
                if (!pCv) continue;

                var temVizinho = $scope.desenhoCroqui[cova][periodo].id == $scope.especie[$scope.periodo].idEspecie;

                if (temVizinho) break;

            }

        }

        return temVizinho;
    }*/

    function selectRemMode(){
        var alertPopup = $ionicPopup.show({
            scope: $scope,
            title: 'Modo de remoção',
            template: '<b>Indivíduo</b>: remove o indivíduo a partir do período selecionado até onde ele ocorre no HP. <br><br> <b>Cultura</b>: remove os indivíduos da espécie, de todas as covas e períodos do HP.',
            buttons: [{
                text: 'Indivíduo',
                type: 'button-energized',
                onTap: function() {
                    $scope.remMode.cultura = false;
                    $scope.remMode.class = 'energized';
                }
            },
            {
                text: 'Cultura',
                type: 'button-assertive',
                onTap: function() {
                    $scope.remMode.cultura = true;
                    $scope.remMode.class = 'assertive';
                }
            }]

        });
    }

    $scope.remMode = { active: false, color: '', cultura: false, class: 'energized' };
    $scope.remModeConfig = function() {
        //$scope.remMode.active = !$scope.remMode.active;
        if($scope.remMode.active) selectRemMode();
        $scope.remMode.color = ($scope.remMode.active) ? '#ffe6e6' : '';
    }


    //filtros
    $scope.filtroEspecieAno = function(esp) {

        var show = esp.periodos.includes($scope.periodo);

        return show;

    }

    $scope.$watch('SAF', function() { return true; }, true);

    //console.log($scope.SAF);

    function calculaAreaPorEstrato() {

        var areaPomar = (globalUserData.SAFEspaco.linhas * globalUserData.SAFEspaco.croquiLinhas) * (globalUserData.SAFEspaco.plantas * globalUserData.SAFEspaco.croquiPlantas);

        var areaPeriodo = [...Array(globalUserData.SAFTempo.horizonte).keys()];

        areaPeriodo = areaPeriodo.map(function(x) {
            return {
                '11': 0,
                '12': 0,
                '13': 0,
                '14': 0
            }
        });

        var covas = Object.keys($scope.desenhoCroqui);

        for (var i = 0; i < covas.length; ++i) {
            var cova = $scope.desenhoCroqui[covas[i]];
            var pers = Object.keys(cova);

            for (var j = 0; j < pers.length; ++j) {
                var per = parseInt(pers[j]);
                var estrato = cova[per].estrato;

                areaPeriodo[per][estrato] += 100 * cova[per].areaCopa / areaPomar;
            }
        }

        return areaPeriodo.map(function(x) {
            x[11] = x[11] > 100 ? 100 : x[11];
            x[12] = x[12] > 100 ? 100 : x[12];
            x[13] = x[13] > 100 ? 100 : x[13];
            x[14] = x[14] > 100 ? 100 : x[14];
            return x;
        });
    }

    $scope.formataPercentualCopa = function(estrato) {

        if (!$scope.areaCopaPeriodo) return;

        var classe;
        switch (estrato) {
            case 11:
                classe = 'Emg.';
                break;
            case 12:
                classe = 'Alt.';
                break;
            case 13:
                classe = 'Med.';
                break;
            case 14:
                classe = 'Bxo.';
                break;
        }

        return classe + ': ' + Math.round($scope.areaCopaPeriodo[$scope.periodo][estrato]) + '%';
    }

    function todasEspecies(croqui) {

        var unSpec = new Set();

        for (var cova in croqui) {
            for (var periodo in croqui[cova]) {
                var id = croqui[cova][periodo].id;
                unSpec.add(id);
            }
        }

        unSpec = Array.from(unSpec);

        for (var i = 0; i < $scope.SAF.especies.length; ++i) {
            var esp = $scope.SAF.especies[i];

            if (!unSpec.includes(esp.idEspecie)) {
                return esp;
            }
        }

        return -1;
    }

    function alertaNaoPlantada(nomEsp) {
        var alertPopup = $ionicPopup.alert({
            template: 'Não foi plantado nenhum indivíduo de <b>' + nomEsp + '</b>!'
        });
    }

    function selectFinalizaSAF(){
        var alertPopup = $ionicPopup.show({
            scope: $scope,
            title: 'Finalizar SAF?',
            template: '<b>Desenho do croqui concluído.</b><br>Se deseja prosseguir para as telas Seleção de Atividades e Fluxo de Caixa, clique em <b>Continuar.</b><br>Se deseja concluir o seu modelo, clique em <b>Finalizar</b>. Essa ação encerra o modelo e não mais permite inserir ou editar informações.',
            buttons: [{
                text: 'Continuar',
                type: 'button-positive',
                onTap: function(e) {
                    globalUserData.SAFComPrescricoes = true;
                    $state.go('prescricaoSAF');
                    $scope.loading = false;
                }
            },
            {
                text: 'Finalizar',
                type: 'button-stable',
                onTap: function(e) {
                    globalUserData.SAFComPrescricoes = false;

                    fromServer.criaSafSql(globalUserData).success(function(res) {
                        globalUserData.SAFFC = res;
                        publicarModelo();            
                    }).error(err => console.log(err));
                }
            }]

        });
    }

    function atualizaModelo(bin) {

        $scope.loading = true;

        var idRec = globalUserData.SAFFC.idRecomendacao;

        var query = "update rl.RLRECOMENDACAO set datProjeto = getdate() where idRecomendacao = " + idRec + "; update RL.RLSAFINFO set flaPublico = " + bin + " where idRecomendacao = " + idRec;

        fromServer.pullData(query).success(function (res) {

            $ionicHistory.nextViewOptions({
                disableBack: true
            });

            $state.go('baixaCroqui');
            $scope.loading = false;
        }).error(err => console.log(err))
    }

    function publicarModelo() {
        var myPopup = $ionicPopup.show({
            template: 'Se você optar por publicar seu modelo SAF, os outros usuários do aplicativo terão acesso à ele. Caso contrário, o acesso é restrito apenas a você.',
            title: 'Publicar modelo?',
            scope: $scope,
            buttons: [{
                    text: 'Sim',
                    type: 'button-positive',
                    onTap: function() {
                        atualizaModelo(1);
                    }
                },
                {
                    text: 'Não',
                    type: 'button-stable',
                    onTap: function() {
                        atualizaModelo(0);
                    }
                }
            ]
        });
    }

    $scope.avancaSAF = function() {

        var esp = todasEspecies($scope.desenhoCroqui);

        if (esp !== -1) {
            alertaNaoPlantada(esp.nomComum);
            return;
        }

        var servSet = new Set();
        var prodSet = new Set();
        for(var cv in $scope.desenhoCroqui){
            var lin = parseInt(cv.split('-')[0]);
            var isSrv = $scope.SAF.linhas.filter(x => (x.index === lin))[0];
            
            for(var p in $scope.desenhoCroqui[cv]){
                var cvPer = $scope.desenhoCroqui[cv][p];
                cvPer.servico = isSrv.servico;

                if(cvPer.servico){
                    servSet.add( cvPer.id );
                }else{
                    prodSet.add( cvPer.id );
                }
            }
        }

        globalUserData.especiesSAF.map(x => {
            var sid = servSet.has(x.idEspecie);
            var pid = prodSet.has(x.idEspecie);
            
            if(sid && pid){
                x.tipoLinha = 'ambas';
            }else if(sid){
                x.tipoLinha = 'servico';
            }else{
                x.tipoLinha = 'producao';
            }

        }, this);        

        globalUserData.croqui = $scope.desenhoCroqui;
        globalUserData.SAFcobertura = $scope.areaCopaPeriodo;
        globalUserData.SAFservico = $scope.SAF.linhas;

        $scope.loading = true;
        $ionicViewSwitcher.nextTransition('none');
        selectFinalizaSAF();
    }

}])

.controller('prescricaoSAFCtrl', ['$scope', '$stateParams', '$state', 'ajudaTopico', '$interval', 'fromServer', '$ionicPopup', '$sce', 'storeValues', '$ionicScrollDelegate', '$timeout', '$ionicViewSwitcher', 'backButtonSet', 'showDica', '$rootScope', function($scope, $stateParams, $state, ajudaTopico, $interval, fromServer, $ionicPopup, $sce, storeValues, $ionicScrollDelegate, $timeout, $ionicViewSwitcher, backButtonSet, showDica, $rootScope) {

    $rootScope.dicas = {index: 10, type: 'SAF'};
    showDica.check(10, 'SAF');

    $scope.$on("$ionicView.enter", function(event, data) {
        //screen.orientation.lock('landscape');
        $timeout(() => backButtonSet.set() , 300);        
    });

    $scope.$on("$ionicView.leave", function(event, data) {
        //screen.orientation.unlock();
        backButtonSet.restore();     
    });

    $scope.SAF = {
        tempo: globalUserData.SAFTempo,
        especies: globalUserData.especiesSAF,
        horizonte: [...Array(globalUserData.SAFTempo.horizonte).keys()],
        especies: globalUserData.especiesSAF
    }

    $scope.getLatin = function(nom) {
        return $sce.trustAsHtml(formataNomCientifico(nom));
    }

    //puxa prescrições
    function prescricoesSQL() {
        var query = "select * from rl.vRLPrescricoesSAF where idEspecie is null or idEspecie in (" + globalUserData.especiesSAF.map(x => x.idEspecie).join(" , ") + ") order by nomOperacao";

        $scope.loading = true;

        fromServer.pullData(query).success(function(res) {
            $scope.prescricoes = angular.fromJson(res);
            $scope.prescDistinct = setOperations(res);
            $scope.indexPresc = Object.keys($scope.prescDistinct);

            $scope.indexPresc.map(x => setReplantio(x));
            
            //console.log($scope);

            $scope.loading = false;
        }).error(err => console.log(err));
    };
    prescricoesSQL();

    $scope.limpaCronograma = function() {

        var myPopup = $ionicPopup.show({
            title: 'Tem certeza que deseja limpar o cronograma?',
            buttons: [{
                    text: 'N\u00e3o',
                    onTap: function(e) {
                        return;
                    }
                },
                {
                    text: '<b>Sim</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        prescricoesSQL();
                    }
                }
            ]
        });

    }

    function setOperations(atividades) {

        var objAtv = {};
        masterLoop: 
        for (var i = 0; i < atividades.length; ++i) {
            var idOp = atividades[i].idOperacao;
            var nmOp = atividades[i].nomOperacao;
            var idEsp = atividades[i].idEspecie;

            var espCor = $scope.SAF.especies.filter(y => y.idEspecie === idEsp).map(z => z.cor)[0];

            var plantio = {};
            var isPlantio = false;
            var isColheita = false;
            var avisoServico = '';
            var material = {};
            var espaco = globalUserData.SAFEspaco;            
            if (espCor) {
                idOp += '_' + idEsp;
                isPlantio  = atividades[i].idOperacao === 84;
                isColheita = atividades[i].idOperacao === 99;

                if (isPlantio) {
                    $scope.SAF.especies.filter(y => y.idEspecie === idEsp)[0].periodos.forEach(element => { 
                        plantio[element] = true;
                        material[element] = {};

                        var insumo = atividades[i].idInsumo;
                        if(insumo === 40){
                            material[element].idInsumo = insumo;

                            var count = 0;                            
                            loop: 
                            for(var iv in globalUserData.croqui){

                                if( !(element in globalUserData.croqui[iv]) ){
                                    continue loop;
                                }

                                var idTemp = globalUserData.croqui[iv][element].id;

                                if(idTemp === idEsp){
                                    count++;
                                }
                            }

                            material[element].valConsumoInsumo = 10000 * count / (espaco.linhas * espaco.plantas * espaco.croquiLinhas * espaco.croquiPlantas);
                        }
                    });
                }else if(isColheita){
                    var linhasEspecie = globalUserData.especiesSAF.filter(x => x.idEspecie === idEsp).map(y => y.tipoLinha)[0];

                    if(linhasEspecie === 'servico'){
                        continue masterLoop;
                    }else if(linhasEspecie === 'ambas'){
                        avisoServico = ' (!)';
                    }
                }
            }

            var append = (idEsp === null) ? '' : (' - ' + atividades[i].nomComum);

            append += avisoServico;

            objAtv[idOp] = {
                title: $sce.trustAsHtml("<span style='color:" + espCor + "'> &#8250; " + nmOp + append + "</span> "),
                nome: nmOp,
                periodos: plantio,
                cor: espCor,
                idEspecie: idEsp,
                idOperacao: atividades[i].idOperacao,
                material: material,
                temRegistro: isPlantio,
                colheita: isColheita
            };

        }

        return objAtv;
    }

    function setReplantio(index){
        var plantio = $scope.prescDistinct[index];

        if(plantio.idOperacao !== 84 || plantio.idEspecie === null){
            return;
        }

        var kPresc = '90_' + plantio.idEspecie;

        if( !(kPresc in $scope.prescDistinct) ){
            return; 
        }

        $scope.loading = true;

        var replantio = $scope.prescDistinct[kPresc];
        replantio.temRegistro = false;        

        for(var i in plantio.periodos){
            replantio.periodos[i] = plantio.periodos[i];

            if(replantio.periodos[i]){
                replantio.temRegistro = true;

                if( !(i in replantio.material) ){
                    replantio.material[i] = {};                    
                }

                var temPlant = plantio.material[i]; 
                var temp = replantio.material[i];
                
                if( !temp.idInsumo && !!temPlant.idInsumo) temp.idInsumo = temPlant.idInsumo;

                if( !temp.valCustoInsumo && !!temPlant.valCustoInsumo ) temp.valCustoInsumo = temPlant.valCustoInsumo;
                
                if( !temp.valConsumoInsumo && !!temPlant.valConsumoInsumo ) temp.valConsumoInsumo = temPlant.valConsumoInsumo * 0.1;

                if( !temp.valRendHH && !!temPlant.valRendHH ) temp.valRendHH = temPlant.valRendHH * 0.2;

                if( !temp.valCustoHH && !!temPlant.valCustoHH ) temp.valCustoHH = temPlant.valCustoHH;
            }else{
                delete replantio.material[i];
            }
        }
 
        $scope.loading = false;
        $scope.autoPreecheAtividades(kPresc);
    }

    $scope.selectPresc = -1;
    $scope.filtraAtividades = function(presc) {

        if ($scope.selectPresc == -1) {
            return true;
        } else if (presc == $scope.selectPresc) {
            return true;
        } else {
            return false;
        }

    }

    $scope.ordenaAtividades = function(presc) {
        return $scope.prescDistinct[presc].nome;
    }

    var posScrollAtividades;
    $scope.clickPresc = function(pr) {
        if ($scope.selectPresc == -1) {

            posScrollAtividades = $ionicScrollDelegate.$getByHandle('handlePresc').getScrollPosition();

            $scope.selectPresc = pr;
            $ionicScrollDelegate.$getByHandle('handlePresc').scrollTop();
            $ionicScrollDelegate.$getByHandle('opcoesAtividade').scrollTop();

        } else {

            setReplantio($scope.selectPresc);

            $scope.selectPresc = -1;
            $ionicScrollDelegate.$getByHandle('handlePresc').scrollTo(0, posScrollAtividades.top, false);

        }
        //$ionicScrollDelegate.resize();
        $scope.periodoAgora = 0;        

    }

    $scope.selecionaAtividade = function(atv, per) {        

        $scope.prescDistinct[atv].periodos[per] = !$scope.prescDistinct[atv].periodos[per];

        //console.log($scope.prescDistinct[atv]);

        $scope.prescDistinct[atv].temRegistro = false;
        for(var p in $scope.prescDistinct[atv].periodos){
            
            var temp = $scope.prescDistinct[atv].periodos[p];
            
            if(temp){
                $scope.prescDistinct[atv].temRegistro = true;
                break;
            }
        }

        if (!$scope.prescDistinct[atv].periodos[per]) {
            delete $scope.prescDistinct[atv].material[per];
            setReplantio(atv);
            return;
        }

        $scope.periodoAgora = per;

        if (Object.keys($scope.prescDistinct[atv].material).length === 0) {

            if($scope.selectPresc === -1) posScrollAtividades = $ionicScrollDelegate.$getByHandle('handlePresc').getScrollPosition();

            $scope.selectPresc = atv;
            $ionicScrollDelegate.$getByHandle('handlePresc').scrollTop();
        }

        if ($scope.prescDistinct[atv].periodos[per] && !$scope.prescDistinct[atv].material[per]) {
            $scope.prescDistinct[atv].material[per] = {};

            $scope.autoPreecheAtividades(atv);
        }
        setReplantio(atv);
    };

    $scope.autoPreecheAtividades = function(atv) {
        //console.log($scope.prescDistinct[atv]);

        $scope.loading = true;

        loop1: for (var i in $scope.prescDistinct[atv].material) {
            var temp = $scope.prescDistinct[atv].material[i];

            if (Object.keys(temp).length > 0) {

                loop2: for (var j in $scope.prescDistinct[atv].material) {
                    var temp2 = $scope.prescDistinct[atv].material[j];

                    if (Object.keys(temp2).length === 0) {
                        $scope.prescDistinct[atv].material[j] = Object.assign({}, temp);
                    }

                    loop3: for(var k in temp){
                        if(!temp2[k]){
                            temp2[k] = temp[k];    
                        }                
                    }
                }
                break loop1;
            }
        }

        $scope.loading = false;
    }

    $scope.waitAutoPreenche = function(){
        $timeout(
            () => {
                $scope.autoPreecheAtividades($scope.selectPresc);
                setReplantio($scope.selectPresc);                
            }, 1200
        )
    }

    $scope.highlightAtividade = function(atv, per) {
        if ($scope.prescDistinct[atv].periodos[per]) {
            return $scope.prescDistinct[atv].cor;
        } else {
            return '#CABFBF';
        };
    }

    $scope.mostraAtividade = function(atv, per) {

        var esp = $scope.prescDistinct[atv].idEspecie;

        if (esp === null) {
            return true;
        } else {
            var pers = $scope.SAF.especies.filter(x => x.idEspecie == esp)[0].selected;

            var pers = Object.keys(pers).filter(y => pers[y]).map(z => parseInt(z));

            return pers.includes(per);
        }
    }

    $scope.periodoAgora = 0;
    $scope.selecionaPeriodo = function(per) {
        $scope.periodoAgora = per;
    }

    $scope.periodoCor = function(per) {
        if (per == $scope.periodoAgora) {
            return '#d0e1e1';
        } else {
            return null;
        }
    }

    $scope.onlyCalendario = false;
    $scope.widthLeft = '68vw';
    $scope.expandeCronograma = function() {
        $scope.onlyCalendario = !$scope.onlyCalendario;

        if ($scope.onlyCalendario) {
            $scope.widthLeft = '98vw';
        } else {
            $scope.widthLeft = '68vw';
        }
    }

    //detalhamento prescrição
    $scope.detPresc = [{
            tipo: 'Equipamento',
            dropDown: true,
            coluna: 'idEquipamento',
            nomeCol: 'nomEquipamento'
        },
        {
            tipo: 'Insumo',
            dropDown: true,
            coluna: 'idInsumo',
            nomeCol: 'nomInsumo'
        },
        {
            tipo: 'Consumo de insumo (quantidade/ha)',
            coluna: 'valConsumoInsumo'
        },
        {
            tipo: 'Custo do insumo (R$/quantidade)',
            coluna: 'valCustoInsumo'
        },
        {
            tipo: 'Rendimento mão-de-obra (HH/ha)',
            coluna: 'valRendHH'
        },
        {
            tipo: 'Custo mão-de-obra (R$/h)',
            coluna: 'valCustoHH'
        },
        {
            tipo: 'Rendimento máquina (HM/ha)',
            coluna: 'valRendHM'
        },
        {
            tipo: 'Custo máquina (R$/h)',
            coluna: 'valCustoHM'
        }
    ]

    $scope.enterDown = function(evt, ind, fid='#fidPresc_'){
        if(evt.keyCode === 13){
            document.querySelector(fid + (ind + 1)).focus();
        }
    }

    $scope.listaEqIn = function(d) {
        return function(pre) {
            var espCrit = true;
            
            if($scope.selectPresc !== -1){
                if($scope.prescDistinct[$scope.selectPresc].idEspecie !== null){
                    espCrit = pre.idEspecie === $scope.prescDistinct[$scope.selectPresc].idEspecie;
                }    
            }

            return ($scope.selectPresc === -1 || !pre[d.coluna]) ? false : pre.idOperacao == $scope.prescDistinct[$scope.selectPresc].idOperacao && espCrit;
        }
    }

    $scope.mostraEqIn = function(col) {
        if ($scope.selectPresc === -1) return;

        if (col == 'valConsumoInsumo' || col == 'valCustoInsumo') {
            col = 'idInsumo';
        } else if (/H/.test(col)) {
            return;
        }

        if (/_/.test($scope.selectPresc)) {
            var pString = $scope.selectPresc.split('_');
            var esp = parseInt(pString[1]);
            var opr = parseInt(pString[0]);
        } else {
            var esp = null;
            var opr = $scope.selectPresc;
        }

        var isNull = $scope.prescricoes.filter(x => (x.idOperacao == opr && x.idEspecie === esp && x[col] === null)).length;

        return isNull > 0;

    };

    function selecaoInvalda(tit, per) {

        var myPopup = $ionicPopup.alert({
            template: "Nenhum valor preenchido para <b>" + tit + "</b>, " + $scope.SAF.tempo.intervalo.view.toLowerCase() + " <strong>" + per + "</strong>."
        });

    }

    function infoFaltando(msg) {

        var myPopup = $ionicPopup.alert({
            template: msg
        });

    }

    function validaAtividades() {
        //console.log($scope);
        var prId = Object.keys($scope.prescDistinct);

        for (var i = 0; i < prId.length; ++i) {
            var temp = $scope.prescDistinct[prId[i]];
            var tempKeys = Object.keys(temp.periodos).filter(x => temp.periodos[x]);

            for (var j = 0; j < tempKeys.length; ++j) {
                var tk = tempKeys[j];

                var tEmpty = Object.keys(temp.material[tk]).filter(x => !!temp.material[tk][x] /*!== null && temp.material[tk][x] !== ""*/).length;

                if (tEmpty === 0) {
                    selecaoInvalda(temp.title, tk);
                    return false;
                };
            }
        }
        return true;
    }

    function salvaAtividades() {

        var finalPresc = [];

        loop1: for (var i in $scope.prescDistinct) {

            loop2: for (var j in $scope.prescDistinct[i].periodos) {
                var per = $scope.prescDistinct[i].periodos[j];
                if (!per) continue loop2;

                var temp = $scope.prescDistinct[i].material[j];
                temp.idOperacao = i;
                temp.nPeriodo = j;
                var errMsg = '<b>' + $scope.prescDistinct[i].title + '. ' + $scope.SAF.tempo.intervalo.view + ' ' + j + '.</b>';

                if (!!temp.valConsumoInsumo && !temp.valCustoInsumo) {
                    errMsg = 'Informações de custo do insumo necessárias ' + errMsg;
                    infoFaltando(errMsg);
                    return -1;

                } else if (!!temp.valCustoInsumo && !temp.valConsumoInsumo) {
                    errMsg = 'Informações de consumo do insumo necessárias ' + errMsg;
                    infoFaltando(errMsg);
                    return -1;

                } else if (!!temp.valRendHH && !temp.valCustoHH) {
                    errMsg = 'Informações de custo da mão-de-obra necessárias ' + errMsg;
                    infoFaltando(errMsg);
                    return -1;

                } else if (!!temp.valCustoHH && !temp.valRendHH) {
                    errMsg = 'Informações de rendimento da mão-de-obra necessárias ' + errMsg;
                    infoFaltando(errMsg);
                    return -1;

                } else if (!!temp.valRendHM && !temp.valCustoHM) {
                    errMsg = 'Informações de custo de máquina necessárias ' + errMsg;
                    infoFaltando(errMsg);
                    return -1;

                } else if (!!temp.valCustoHM && !temp.valRendHM) {
                    errMsg = 'Informações de rendimento de máquina necessárias ' + errMsg;
                    infoFaltando(errMsg);
                    return -1;

                } else if (!temp.valCustoHM && !temp.valCustoHH && !temp.valRendHM && !temp.valRendHH) {
                    errMsg = 'Informações de rendimento e custo de mão-de-obra (HH) <b>OU</b> rendimento e custo de máquina (HM) necessárias ' + errMsg;
                    infoFaltando(errMsg);
                    return -1;

                } else if (!!temp.unidade || !!temp.produtividade || !!temp.preco || !!temp.idProduto) {

                    if (!temp.unidade || !temp.produtividade || !temp.preco || !temp.idProduto) {
                        errMsg = 'Complete as informações de preço e produtividade ' + errMsg;
                        infoFaltando(errMsg);
                        return -1;
                    }
                }

                finalPresc.push(temp);
            }

        }

        return finalPresc;

    }

    //dados de colheita

    $scope.fechaAtividades = function () {
        if (validaAtividades()) {
            var selecaoAtividades = salvaAtividades();

            if (selecaoAtividades !== -1) {
                globalUserData.prescricoesSAF = selecaoAtividades;
                $scope.loading = true;

                fromServer.criaSafSql(globalUserData).success(function (res) {
                    globalUserData.SAFFC = res;
                    $state.go('fluxoCaixaSAF');
                    $scope.loading = false;
                }).error(err => console.log(err));
            }
        };
    }

    $scope.$watch('selectPresc', function() {
        $scope.loading = true;
        $timeout(function() { $scope.loading = false; }, 300);
    }, true);

}])

.controller('fluxoCaixaSAFCtrl', ['$scope', '$stateParams', '$state', 'ajudaTopico', 'fromServer', '$ionicPopup', 'storeValues', '$cordovaSocialSharing', '$ionicViewSwitcher', '$ionicScrollDelegate', '$ionicHistory', 'linkHelp', 'showDica', '$rootScope', function($scope, $stateParams, $state, ajudaTopico, fromServer, $ionicPopup, storeValues, $cordovaSocialSharing, $ionicViewSwitcher, $ionicScrollDelegate, $ionicHistory, linkHelp, showDica, $rootScope) {

    $rootScope.dicas = {index: 12, type: 'SAF'};
    showDica.check(12, 'SAF');

    $scope.linkHelp = function (info) {

        $scope.loading = true;

        linkHelp.set('fluxo de caixa');

        linkHelp.call().success(function (res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    /*$scope.$on("$ionicView.enter", function(event, data) {
        screen.orientation.lock('landscape');
    });

    $scope.$on("$ionicView.leave", function(event, data) {
        screen.orientation.unlock();
    });*/

    void function() {
        $scope.loading = true;
        for (var i = 0; i < globalUserData.SAFFC.gantt.length; ++i) {
            var temp = globalUserData.SAFFC.gantt[i];

            if (Array.isArray(temp.especies)) {
                temp.especies = {};
            }

            if (Array.isArray(temp.operacoes)) {
                temp.operacoes = {};
            }
        }
        $scope.loading = false;
    }();

    $scope.defArea = {
        string: '/ha',
        append: 'Ha',
        ha: true,
        descontar: false
    }

    $scope.show = {
        leftPanel: true,
        chart: false,
        rightWidth: '68vw'
    }


    $scope.expandeTela = function() {
        $scope.show.leftPanel = !$scope.show.leftPanel;
        $scope.show.rightWidth = $scope.show.leftPanel ? '68vw' : '100%';
        $scope.geraGrafico();
    }

    $scope.alternaArea = function() {
        if ($scope.defArea.ha) {
            $scope.defArea.string = '/ha';
            $scope.defArea.append = 'Ha';
        } else {
            $scope.defArea.append = $scope.defArea.string = '';
        }
        $scope.geraGrafico();
    }

    $scope.timeLength = 1 + globalUserData.SAFTempo.horizonte;

    $scope.tempo = globalUserData.SAFTempo;
    $scope.horizonte = [...Array(globalUserData.SAFTempo.horizonte).keys()];

    $scope.FC = globalUserData.SAFFC.gantt;
    $scope.indicadores = globalUserData.SAFFC.indicadores;
    $scope.receitaEspecies = globalUserData.SAFFC.especies;
    $scope.custoOperacoes = globalUserData.SAFFC.operacoes;

    $scope.retornaValor = function(t, item, custo = true) {
        var obj = custo ? 'operacoes' : 'especies';
        
        if($scope.defArea.descontar){
            var nomValor = custo ? 'VPLc' : 'VPLr';            
        }else{
            var nomValor = custo ? 'custo' : 'receita';        
        }

        if (!(obj in $scope.FC[t])) {
            return;
        }

        var eval = $scope.FC[t][obj];

        if (!(item in eval)) {
            return;
        }

        nomValor += $scope.defArea.append;

        var valNumber =  eval[item][nomValor];

        if(!!valNumber){
            return valNumber.toFixed(2);            
        }

    };

    $scope.retornaTotais = function(tot, total = true, custo=false){

        if(!tot) return;
        
        var retorna;

        if (total) {
            retorna = $scope.defArea.descontar ? tot.VPLAcHa : tot.acumuladoHa;
        } else if (custo) {
            retorna = $scope.defArea.descontar ? tot.VPLcHa : tot.totCustoHa;
        } else {
            retorna = $scope.defArea.descontar ? tot.VPLrHa : tot.totReceitaHa;
        }

        return retorna.toFixed(2);
    }

    $scope.zoomOut = function() {
        $ionicScrollDelegate.$getByHandle('gantt').zoomTo(1, true, 0, 0);
    }

    //gráfico
    $scope.geraGrafico = function() {

        var valores = $scope.defArea.descontar ? 'VPLAc' : 'acumulado';

        $scope.chartData = [$scope.FC.map(x => x[valores + $scope.defArea.append])];

        $scope.series = ['Total Acumulado (R$' + $scope.defArea.string + ')'];
        
        $scope.options = {
            legend: { display: true, position: 'bottom' },
            tooltips: { enabled: true },
            title: { text: 'Fluxo de Caixa', display: true, fontStyle: 'normal', padding: 2 },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Acumulado (R$" + $scope.defArea.string + ")",
                        fontSize: 14
                    },
                    type: 'linear',
                    display: true,
                    position: 'left'
                        //,ticks: { min: -25, stepSize: 50 }
                }],
                xAxes: [{
                    position: 'bottom',
                    display: true,
                    ticks: { min: 0, stepSize: 2 },
                    scaleLabel: {
                        display: true,
                        labelString: $scope.tempo.intervalo.view,
                        padding: 0,
                        fontSize: 14
                    }
                }]
            }
        };

        if($scope.defArea.descontar) $scope.options.title.text += ' (valores descontados)';
    }

    $scope.geraGrafico();

    function publicarModelo() {
        var myPopup = $ionicPopup.show({
            template: 'Se você optar por publicar seu modelo SAF, os outros usuários do aplicativo terão acesso à ele. Caso contrário, o acesso é restrito apenas a você.',
            title: 'Publicar modelo?',
            scope: $scope,
            buttons: [{
                    text: 'Sim',
                    type: 'button-positive',
                    onTap: function() {
                        atualizaModelo(1);
                    }
                },
                {
                    text: 'Não',
                    type: 'button-stable',
                    onTap: function() {
                        atualizaModelo(0);
                    }
                }
            ]
        });
    }

    function atualizaModelo(bin) {

        $scope.loading = true;

        var idRec = globalUserData.SAFFC.idRecomendacao;

        var query = "update rl.RLRECOMENDACAO set datProjeto = getdate() where idRecomendacao = " + idRec + "; update RL.RLSAFINFO set flaPublico = " + bin + " where idRecomendacao = " + idRec;

        fromServer.pullData(query).success(function(res) {

            $ionicHistory.nextViewOptions({
                disableBack: true
            });

            $state.go('baixaCroqui');
            $scope.loading = false;
        }).error(err => console.log(err))
    }

    $scope.finalizaSAF = function() {
        publicarModelo();
    }


}])

.controller('baixaCroquiCtrl', ['$scope', '$stateParams', '$state', 'ajudaTopico', 'fromServer', '$ionicPopup', 'storeValues', '$cordovaSocialSharing', 'linkHelp', function($scope, $stateParams, $state, ajudaTopico, fromServer, $ionicPopup, storeValues, $cordovaSocialSharing, linkHelp) {

    $scope.linkHelp = function (info) {

        $scope.loading = true;

        linkHelp.set('SAF');

        linkHelp.call().success(function (res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    function msgAviso(msg) {
        var alertPopup = $ionicPopup.alert({
            title: msg
        });
    };

    var url = sqlAdress.server + "files/";
    var xlsUrl = url + globalUserData.SAFFC.idRecomendacao + '.xlsx';

    $scope.downXLS = function() {
        cordova.InAppBrowser.open(xlsUrl, '_system', 'location=no');
    };

    $scope.emailXLS = function() {
        $scope.loading = true;

        fromServer.emailCroqui(globalUserData.SAFFC.idRecomendacao + '.xlsx', globalUserData.usuario).success(function(em) {
            msgAviso(em);
            $scope.loading = false;
        }).error(function(err) {
            msgAviso(em);
            $scope.loading = false;
        })
    }

    $scope.share = function() {
        var options = {
            message: 'Veja meu modelo de SAF!',
            subject: 'Projeto Rural Legal',
            files: [xlsUrl]
        }

        var onSuccess = function(result) {
            console.log("Share completed? " + result.completed);
            console.log("Shared to app: " + result.app);
        }

        var onError = function(msg) {
            console.log("Sharing failed with message: " + msg);
        }

        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    }

}])

.controller('montaPropriedadeCtrl', ['$scope', '$stateParams', '$state', 'ajudaTopico', 'fromServer', '$ionicPopup', 'storeValues', '$cordovaSocialSharing', '$timeout', 'valid', 'showDica', '$rootScope', 'linkHelp', function($scope, $stateParams, $state, ajudaTopico, fromServer, $ionicPopup, storeValues, $cordovaSocialSharing, $timeout, valid, showDica, $rootScope, linkHelp) {

    $scope.linkHelp = function (info) {

        $scope.loading = true;

        linkHelp.set('localização');

        linkHelp.call().success(function (res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    $rootScope.dicas = {index: 13, type: 'MPR'};
    showDica.check(13, 'MPR');

    //check user
    function getUser() {
        $scope.loading = true;
        var query = "select * from rl.rlusuario where nomUsuario = '" + globalUserData.login.usuario + "'";

        fromServer.pullData(query).success(function(res) {
            globalUserData.usuario = res[0];
            $scope.bounds.selCAR = globalUserData.usuario.idCARDefault;
            loadSafData();
        });
    }

    void function() {

        var logg = globalUserData.login;
        globalUserData = { login: logg };

        if (valid !== 'autorizado') {
            storeValues.destroy('user');
            storeValues.destroy('pass');
            $state.go('login');
        } else {
            getUser();
        }
    }();

    var apenasPrivado = true;
    $scope.corBotaoAgora = function(priv = true) {
        if (apenasPrivado === priv) {
            return { "background-color": '#d0e1e1' };
        }
    }

    $scope.publicoPrivado = function(bool = true){
        apenasPrivado = bool;
    }

    $scope.filtroPubPriv = function(mod){
        var flag = apenasPrivado ? 0 : 1;
        return mod.flaPublico === flag;
    }

    //color list
    var shapeCols = globalColorList;

    var defaultStyle = {
        "color": "black",
        "weight": 5,
        "opacity": 0.5,
        "fillOpacity": 0.05
    };

    //alertas
    function mapAlerta(msg) {

        var myPopup = $ionicPopup.alert({
            template: msg
        });

    }

    //load from DB
    function loadSafData() {

        var query = "declare @idUser int = " + globalUserData.usuario.idUsuario + "; select OBJECTID, nomLocal from rl.RLPOLIGONOSAF where flaBorda = 1 and (idUsuario = @idUser or idUsuario = 1) order by idUsuario DESC; exec RL.RLDetalhesProjetosSAF " + globalUserData.usuario.idUsuario;

        $scope.loading = true;

        fromServer.pullProc(query).success(function(res) {

            $scope.propriedades = res.filter(x => !!x.OBJECTID);
            $scope.modelos = res.filter(x => !!x.idRecomendacao);
            for (var i = 0; i < $scope.modelos.length; ++i) {
                $scope.modelos[i].cor = shapeCols[i];
            }

            $scope.loading = false;
        }).error(x => console.log(x));
    }

    //manipula projetos
    $scope.ativaProjeto = function(prj) {
        $scope.projAtivo = prj;

        for (var i = 0; i < $scope.modelos.length; ++i) {
            $scope.modelos[i].bg = '';
        }

        $scope.projAtivo.bg = '#d0e1e1';
        defaultStyle.color = prj.cor;

        drawControl.setDrawingOptions({
            rectangle: {
                shapeOptions: defaultStyle
            },
            polygon: {
                shapeOptions: defaultStyle
            }
        });
    }

    //load map layer
    var mymap = L.map('leafMap').setView([-22.243433, -47.739347], 13);
    
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
    }).addTo(mymap);

    var zoomToGlobal = L.Control.extend({

        options: {
            position: 'topleft'
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

            container.style.backgroundColor = 'white';
            container.style.width = '36px';
            container.style.height = '36px';
            container.style.backgroundImage = "url(img/worldwide.svg)";
            container.style.backgroundSize = "21px 21px";
            container.style.padding = '0px';
            container.style.backgroundRepeat = 'no-repeat';
            container.style.backgroundPosition = 'center';
            

            container.onclick = function () {
                if(boundary){
                    mymap.fitBounds(boundary.getBounds());
                }else{
                    var lyrs = Object.keys(drawnItems._layers);
                    if(lyrs.length > 0) mymap.fitBounds(drawnItems.getBounds());
                }
            }
            return container;
        }
    });

    mymap.addControl(new zoomToGlobal());

    //load map boundary
    $scope.bounds = {};
    var boundary = false;
    var carBoundary = false;  
    $scope.getBoundary = function(prop, car = false) {
        
        $scope.loading = true;

        var geoJsonUrl = sqlAdress.ip + ":8080/geoserver/ATER/wfs?request=GetFeature&version=2.0&typeName=ATER:propriedade_saf&outputFormat=json&viewparams=obj:" + prop;

        if(car){
            geoJsonUrl = geoJsonUrl.replace('propriedade_saf','car_sp').replace('obj:', 'ncar:');
            $scope.bounds.selProp = null;            
        }else{
            $scope.bounds.selCAR = null;    
        }

        fromServer.getGeoJSON(geoJsonUrl).success(function(res) {

            if(typeof res !== 'object'){
                mapAlerta("Não temos acesso à propriedade com esse CAR ou o número não é válido.");
                $scope.loading = false;
                return;

            }else if(res.features.length === 0){
                mapAlerta("Não temos acesso à propriedade com esse CAR ou o número não é válido.");
                $scope.loading = false;
                return;
            }

            carBoundary = car;
            delete $scope.projAtivo;

            for (var i = 0; i < $scope.modelos.length; ++i) {
                $scope.modelos[i].bg = '';
            }

            defaultStyle.color = '#000000';

            drawControl.setDrawingOptions({
                rectangle: {
                    shapeOptions: defaultStyle
                },
                polygon: {
                    shapeOptions: defaultStyle
                }
            });

            mymap.eachLayer(function(layer) {
                if ('feature' in layer) {
                    if ('properties' in layer.feature) {
                        if ('OBJECTID' in layer.feature.properties) {
                            mymap.removeLayer(layer);
                        }
                    }
                }
            });

            var borderStyle = {
                "color": "black",
                "weight": 4,
                "opacity": 1,
                "fillOpacity": 0
            };

            boundary = L.geoJSON(res, { style: borderStyle }).addTo(mymap);

            if(car){
                $scope.idBoundary = "'"+res.features[0].properties.CAR+"'";
                $scope.areaBoundary = (turf.area(res) / 10000).toFixed(2);
            }else{
                $scope.areaBoundary = res.features[0].properties.areaHa.toFixed(2);
                $scope.idBoundary = res.features[0].properties.OBJECTID;   
            }

            mymap.fitBounds(boundary.getBounds());
            mymap.setMaxBounds(boundary.getBounds());
            drawnItems.clearLayers();

            $scope.loading = false;

        });
    }

    //draw properties
    var drawnItems;
    var drawControl;

    function createDrawFG() {
        drawnItems = new L.FeatureGroup();
        drawnItems.addTo(mymap);

        drawControl = new L.Control.Draw({
            draw: {
                position: 'topleft',
                polygon: {
                    allowIntersection: false,
                    drawError: {
                        color: '#e1e100',
                        message: 'Desenhe apenas formas simples!'
                    },
                    shapeOptions: defaultStyle
                },
                polyline: false,
                rectangle: {
                    shapeOptions: defaultStyle
                },
                circle: false,
                marker: false,
                circlemarker: false

            },
            edit: {
                featureGroup: drawnItems,
                remove: true
            }
        });

        mymap.addControl(drawControl);
    }
    createDrawFG();

    function drawPolygon(event) {

        var layer = event.layer;
        if (!!$scope.projAtivo) layer.idRecomendacao = $scope.projAtivo.idRecomendacao;

        drawnItems.addLayer(layer);
    }


    var isInteracting = false;

    function userInteracting() {
        isInteracting = true;
    }

    function stopInteracting() {
        $timeout(function() { isInteracting = false }, 200);
    }


    //eventos
    function onMapClick(e) {
        if (isInteracting) return;

        var ponto = turf.point([e.latlng.lng, e.latlng.lat]);

        drawnItems.eachLayer(function(x) {
            var intersection = turf.intersect(x.toGeoJSON(), ponto);
            if (!!intersection) {
                x.setStyle(defaultStyle);
                if (!!$scope.projAtivo) x.idRecomendacao = $scope.projAtivo.idRecomendacao;
            }
        });
    }

    function calculaArea() {
        drawnItems.eachLayer(function(x) {
            x.areaHa = turf.area(x.toGeoJSON()) / 10000;
            x.bindTooltip('área: ' + x.areaHa.toFixed(2) + ' ha');
        });
    }

    mymap.on(L.Draw.Event.CREATED, drawPolygon);
    mymap.on('click', onMapClick);

    mymap.on(L.Draw.Event.DRAWSTART, userInteracting);
    mymap.on(L.Draw.Event.EDITSTART, userInteracting);
    mymap.on(L.Draw.Event.DELETESTART, userInteracting);

    mymap.on(L.Draw.Event.EDITSTOP, stopInteracting);
    mymap.on(L.Draw.Event.DELETESTOP, stopInteracting);
    mymap.on(L.Draw.Event.DRAWSTOP, function() {
        calculaArea();
        stopInteracting();
    });

    //servidor

    function makeWKT() {

        var insertCols = 'insert into rl.RLPOLIGONOSAF (idPlanoPropriedade, flaBorda, idUsuario, idBorda, idRecomendacao, cor, Shape) values (@idPlano , 0, ' + globalUserData.usuario.idUsuario + ', ' + (!!$scope.idBoundary ? $scope.idBoundary : null) + ', ';
        var wktArray = [];
        for (var k in drawnItems._layers) {
            var ltln = drawnItems._layers[k]._latlngs[0];
            var wkt = 'MULTIPOLYGON( ((';

            for (var i = 0; i < ltln.length; ++i) {
                if (i > 0) wkt += ', ';
                wkt += ltln[i].lng + ' ' + ltln[i].lat;
            }
            wkt += ', ' + ltln[0].lng + ' ' + ltln[0].lat + ')) )';

            var insertQuery = insertCols +
                (!!drawnItems._layers[k].idRecomendacao ? drawnItems._layers[k].idRecomendacao : null) +
                ", '" + drawnItems._layers[k].options.color +
                "', geometry::STGeomFromText ('" + wkt + "', 4326))";

            wktArray.push(insertQuery);
        }

        return wktArray.join('; ');

    }

    $scope.enviaPropriedade = function() {

        if (Object.keys(drawnItems._layers).length === 0) {
            mapAlerta('Nenhum polígono desenhado!');
            return;
        }

        $scope.loading = true;
        var query = makeWKT();

        if(carBoundary){
            query = query.split('idBorda').join('idCAR');
        }

        fromServer.montaPropriedade(globalUserData.usuario.idUsuario, query).success(function(res) {
            globalUserData.idPlanoPropriedade = res[0].idPlanoPropriedade;
            $state.go('baixaMapaPropriedade');
            $scope.loading = false;
        }).error(x => console.log(x));

    }

}])

.controller('baixaMapaPropriedadeCtrl', ['$scope', '$stateParams', '$state', 'ajudaTopico', 'fromServer', '$ionicPopup', 'storeValues', '$cordovaSocialSharing', 'linkHelp', function($scope, $stateParams, $state, ajudaTopico, fromServer, $ionicPopup, storeValues, $cordovaSocialSharing, linkHelp) {
    
    $scope.linkHelp = function (info) {

        $scope.loading = true;

        linkHelp.set('mapa');

        linkHelp.call().success(function (res) {
            linkHelp.info(res, info);
            $scope.loading = false;
        }).error(x => console.log(x))

    }

    function msgAviso(msg) {
        var alertPopup = $ionicPopup.alert({
            title: msg
        });
    };

    var url = sqlAdress.server + "mapas/" + globalUserData.idPlanoPropriedade + '/' ;
    var picUrl = url + 'safs.png';
    $scope.picture = picUrl;

    $scope.downPNG = function() {
        cordova.InAppBrowser.open(picUrl, '_system', 'location=no');
    };

    $scope.emailPNG = function() {
        $scope.loading = true;

        fromServer.emailMapa(globalUserData.idPlanoPropriedade, globalUserData.usuario).success(function(em) {
            msgAviso(em);
            console.log(em);
            $scope.loading = false;
        }).error(function(err) {
            msgAviso(em);
            $scope.loading = false;
        })
    }

    $scope.share = function() {
        var options = {
            message: 'Veja o mapa da propriedade com os modelos de SAF!',
            subject: 'Mapa Rural Legal',
            files: [picUrl]
        }

        var onSuccess = function(result) {
            console.log("Share completed? " + result.completed);
            console.log("Shared to app: " + result.app);
        }

        var onError = function(msg) {
            console.log("Sharing failed with message: " + msg);
        }

        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    }

}])

.controller('youTubeCtrl', ['$scope', '$stateParams', '$state', '$cordovaSocialSharing', function($scope, $stateParams, $state, $cordovaSocialSharing) {

    $scope.abreLink = function() {
        cordova.InAppBrowser.open('https://www.youtube.com/channel/UCdVv814eCniBwoKYOE-D72w/videos', '_system', 'location=no');
    }

}])