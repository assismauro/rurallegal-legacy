angular.module('app.services', [])

.factory('fromServer', ['$http', function($http) {

    var dbip = sqlAdress.server;

    var fromServer = {};

    fromServer.pullData = function(query) {
        var send = { 'query': query };

        return $http({
            method: 'POST',
            url: dbip + 'app_data.php',
            data: send,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.pullProc = function(query) {
        var send = { 'query': query };

        return $http({
            method: 'POST',
            url: dbip + 'app_procedure.php',
            data: send,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.registerUser = function(obj) {
        return $http({
            method: 'POST',
            url: dbip + 'app_register.php',
            data: obj,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.validateUser = function(user, pass) {
        var send = { 'user': user, 'pass': pass };
        return $http({
            method: 'POST',
            url: dbip + 'app_authenticate.php',
            data: send,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.sendEmail = function(name, email, cadastro = true, file = '') {
        var send = { 'name': name, 'email': email, 'cadastro': cadastro, 'file': file };

        return $http({
            method: 'POST',
            url: dbip + 'app_email.php',
            data: send,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.reportData = function(project, grid, legend) {
        var send = { 'proj': project, 'grid': grid, 'legend': legend };

        return $http({
            method: 'POST',
            url: dbip + 'app_report.php',
            data: send,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.updateUserData = function(user_data) {
        return $http({
            method: 'POST',
            url: dbip + 'app_atualiza_usuario.php',
            data: user_data,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.changePassword = function(name, email) {
        var send = { 'name': name, 'email': email };

        return $http({
            method: 'POST',
            url: dbip + 'app_esqueceu_senha.php',
            data: send,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.getRelatorio = function(idEspecie, idEstado = 1) {
        var send = { 'idEspecie': idEspecie, 'idEstado': idEstado };

        return $http({
            method: 'POST',
            url: dbip + 'app_especie.php',
            data: send,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.getGrid = function(idRecomendacao, idModeloPlantio) {
        var send = { 'idRecomendacao': idRecomendacao, 'modeloPlantio': idModeloPlantio };

        return $http({
            method: 'POST',
            url: dbip + 'app_grid.php',
            data: send,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.enviaCroqui = function(croqui) {

        return $http({
            method: 'POST',
            url: dbip + 'app_croqui.php',
            data: croqui,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.emailCroqui = function(file, user) {
        var send = { 'file': file, 'usuario': user };

        return $http({
            method: 'POST',
            url: dbip + 'app_emailSAF.php',
            data: send,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.pullPageEnciclopedia = function(query, pag, counter) {
        var send = { 'query': query, 'page': pag, 'count': counter };

        return $http({
            method: 'POST',
            url: dbip + 'app_pageEnciclopedia.php',
            data: send,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.exportPageEnciclopedia = function(query, user, topico, header, format = 'xlsx') {
        var send = { 'query': query, 'user': user, 'topic': topico, 'head': header, 'format': format };

        return $http({
            method: 'POST',
            url: dbip + 'app_tabEnciclopedia.php',
            data: send,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.criaSafSql = function(obj) {
        return $http({
            method: 'POST',
            url: dbip + 'app_recomendacao_saf.php',
            data: obj,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    }

    fromServer.getGeoJSON = function(url) {
        return $http({
            url: url,
            datatype: 'json'
        });
    };

    fromServer.montaPropriedade = function(idUsuario, query) {
        return $http({
            method: 'POST',
            url: dbip + 'app_monta_propriedade.php',
            data: { 'idUsuario': idUsuario, 'query': query },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    fromServer.emailMapa = function(file, user) {
        var send = { 'file': file + '/mapas.zip', 'usuario': user };

        return $http({
            method: 'POST',
            url: dbip + 'app_emailMapa.php',
            data: send,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded ; charset=utf-8' }
        });
    };

    return fromServer;

}])

.factory('storeValues', [function() {

    return {
        set: function(key, value) {
            return localStorage.setItem(key, value);
        },
        get: function(key) {
            return localStorage.getItem(key);
        },
        destroy: function(key) {
            return localStorage.removeItem(key);
        },
        dica: function(id) {
            return globalUserData.dicas.filter(x => x.idDica === id)[0].dica;
        },
        dicaSAF: function(id) {
            return globalUserData.dicasSAF.filter(x => x.idDica === id)[0].dica;
        },
        dicaENC: function(id) {
            return globalUserData.dicasENC.filter(x => x.idDica === id)[0].dica;
        },
        dicaMPR: function(id) {
            return globalUserData.dicasMPR.filter(x => x.idDica === id)[0].dica;
        }
    };

}])

.factory('mapLayer', [function() {

    var geoadress = sqlAdress.ip + ':8080/geoserver/ATER/wms?service=WMS&version=1.1.0&request=GetMap';

    var mapLayer = {};

    mapLayer.getBoundsZoomLevel = function(bounds, mapDim) {
        var WORLD_DIM = { height: 256, width: 256 };
        var ZOOM_MAX = 21;

        function latRad(lat) {
            var sin = Math.sin(lat * Math.PI / 180);
            var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
            return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
        }

        function zoom(mapPx, worldPx, fraction) {
            return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
        }

        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();

        var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

        var lngDiff = ne.lng() - sw.lng();
        var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

        var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
        var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

        return Math.min(latZoom, lngZoom, ZOOM_MAX);
    }

    mapLayer.getLink = function(parLayers, parSQLBBox, parView) {

        var layer = (parLayers == 'munfito') ? 'layers=ATER:munfito' : 'layers=ATER:car_sp';

        var llBox = parSQLBBox.split(', ');
        var lonLatBottomLeft = llBox[4].substr(0, llBox[4].length - 2).split(' ');
        var lonLatTopRight = llBox[2].split(' ');

        var view = (parLayers == 'munfito') ? ('viewparams=mun:' + parView[0] + ';fito:' + parView[1] + ';') : ('viewparams=ncar:' + parView + ';');

        var imgLink = geoadress + '&' + layer + '&styles=line&bbox=' + lonLatBottomLeft[0] + ',' + lonLatBottomLeft[1] + ',' + lonLatTopRight[0] + ',' + lonLatTopRight[1] + '&width=500&height=500&srs=EPSG:4326&format=image%2Fpng&transparent=true&' + view;

        var feature = {
            lonTopRight: parseFloat(lonLatTopRight[0]),
            latTopRight: parseFloat(lonLatTopRight[1]),
            lonBottomLeft: parseFloat(lonLatBottomLeft[0]),
            latBottomLeft: parseFloat(lonLatBottomLeft[1]),
            png: imgLink,
            getCenter: function() {
                var out = {};
                out.lat = (this.latTopRight + this.latBottomLeft) / 2;
                out.lon = (this.lonTopRight + this.lonBottomLeft) / 2;

                return out;
            }
        };

        //console.log(feature);

        return feature;

    }

    return mapLayer;

}])

.service('tabelaEnciclopedia', ['$http', 'fromServer', function($http, fromServer) {

    var tabela = [];
    var categoria;

    var queries = {
        viveiros: {
            self: 'viveiros',
            titulo: 'Viveiros',
            template: 'enciclopediaDados',
            where: "select top(_PAGE_)  (ROW_NUMBER() OVER (_COL_)) 'n', nomMunicipio, nomReduzido, numTelefone, desEmail, desLink, nomCompleto from rl.rlempresa where idTipoEmpresa = 1 ",
            and: '',
            sort: 'order by nomMunicipio',
            search: 'munic\u00edpio ou viveiro',
            searchCol: 'nomMunicipio',
            header: ['', 'Munic\u00edpio', 'Nome', 'Telefone', 'e-mail', 'Site', 'Raz\u00e3o social'],
            page: 0,
            counter: 'select count(*) as n from rl.rlempresa where idTipoEmpresa = 1 '
        },
        eMad: {
            self: 'eMad',
            titulo: 'Empresas madeireiras',
            template: 'enciclopediaDados',
            where: "select top(_PAGE_)  (ROW_NUMBER() OVER (_COL_)) 'n', nomMunicipio, nomReduzido, numTelefone, desEmail, desLink, nomCompleto from rl.rlempresa where idTipoEmpresa = 2 ",
            and: '',
            sort: 'order by nomMunicipio',
            search: 'munic\u00edpio ou empresa',
            searchCol: 'nomMunicipio',
            header: ['', 'Munic\u00edpio', 'Nome', 'Telefone', 'e-mail', 'Site', 'Raz\u00e3o social'],
            page: 0,
            counter: 'select count(*) as n from rl.rlempresa where idTipoEmpresa = 2 '
        },
        eNm: {
            self: 'eNm',
            titulo: 'Empresas n\u00E3o madeireiras',
            template: 'enciclopediaDados',
            where: "select top(_PAGE_)  (ROW_NUMBER() OVER (_COL_)) 'n', nomMunicipio, nomReduzido, numTelefone, desEmail, desLink, nomCompleto from rl.rlempresa where idTipoEmpresa = 3 ",
            and: '',
            sort: 'order by nomMunicipio',
            search: 'munic\u00edpio ou empresa',
            searchCol: 'nomMunicipio',
            header: ['', 'Munic\u00edpio', 'Nome', 'Telefone', 'e-mail', 'Site', 'Raz\u00e3o social'],
            page: 0,
            counter: 'select count(*) as n from rl.rlempresa where idTipoEmpresa = 3 '
        },
        especies: {
            self: 'especies',
            titulo: 'Esp\u00e9cies SP',
            template: 'enciclopediaDados',
            where: "select top(_PAGE_)  E.idEspecie, (ROW_NUMBER() OVER (_COL_)) 'n', EN.nomComumOutro, E.nomCientifico from rl.RLESPECIEESTADO EE left join rl.rlespecie E on E.idEspecie = EE.idEspecie left join rl.rlespecienome EN on EE.idEspecie = EN.idEspecie where EE.idEstado = 1 ",
            and: '',
            sort: 'order by nomCientifico',
            search: 'nome comum ou científico',
            searchCol: 'nomComumOutro',
            header: ['', 'Nome comum', 'Nome cient\u00edfico'],
            omit: ['idEspecie'],
            page: 0,
            counter: 'select count(*) as n from rl.RLESPECIEESTADO EE left join rl.rlespecie E on E.idEspecie = EE.idEspecie left join rl.rlespecienome EN on EE.idEspecie = EN.idEspecie where EE.idEstado = 1 '
        },
        especiesPA: {
            self: 'especiesPA',
            titulo: 'Esp\u00e9cies PA',
            template: 'enciclopediaDados',
            where: "select top(_PAGE_)  E.idEspecie, (ROW_NUMBER() OVER (_COL_)) 'n', EN.nomComumOutro, E.nomCientifico from rl.RLESPECIEESTADO EE left join rl.rlespecie E on E.idEspecie = EE.idEspecie left join rl.rlespecienome EN on EE.idEspecie = EN.idEspecie where EE.idEstado = 2 ",
            and: '',
            sort: 'order by nomCientifico',
            search: 'nome comum ou científico',
            searchCol: 'nomComumOutro',
            header: ['', 'Nome comum', 'Nome cient\u00edfico'],
            omit: ['idEspecie'],
            page: 0,
            counter: 'select count(*) as n from rl.RLESPECIEESTADO EE left join rl.rlespecie E on E.idEspecie = EE.idEspecie left join rl.rlespecienome EN on EE.idEspecie = EN.idEspecie where EE.idEstado = 2 '
        },
        helpApp: {
            self: 'helpApp',
            titulo: 'Ajuda do aplicativo',
            template: 'enciclopediaDados',
            where: "select top(_PAGE_)  idItemHelp, (ROW_NUMBER() OVER (_COL_)) 'n', nomItemHelp, nomTela, desDefinicao, referencia from rl.rlhelpapp where idItemHelp >= 0 ",
            and: '',
            sort: 'order by nomTela',
            search: 't\u00f3pico',
            searchCol: 'nomTela',
            header: ['', 'Item', 'Tela'],
            omit: ['idItemHelp', 'desDefinicao', 'referencia'],
            page: 0,
            counter: 'select count(*) as n from rl.rlhelpapp where idItemHelp >= 0 '
        },
        modSucesso: {
            self: 'modSucesso',
            titulo: 'Modelos de sucesso',
            template: 'enciclopediaDados',
            where: "",
            and: '',
            sort: '',
            search: '',
            searchCol: '',
            header: [],
            page: 0,
            counter: ''
        },
        depoimentos: {
            self: 'depoimentos',
            titulo: 'Depoimentos',
            template: 'enciclopediaDados',
            where: "",
            and: '',
            sort: '',
            search: '',
            searchCol: '',
            header: [],
            page: 0,
            counter: ''
        }
    };

    var setCat = function(catName) {

        categoria = Object.assign({}, queries[catName]);

        return categoria;
    }

    var getCat = function() {
        return categoria;
    }

    var setSearch = function(val) {
        categoria.and = (typeof val === 'undefined') ? '' : 'and (' + categoria.searchCol + " like '%" + val + "%'";

        if (categoria.self == 'especies' || categoria.self == 'especiesPA') {
            categoria.and += " or nomCientifico like '%" + val + "%' ";
        } else if (categoria.self == 'helpApp') {
            categoria.and += " or nomItemHelp like '%" + val + "%'";
        } else if (['viveiros', 'eNm', 'eMad'].includes(categoria.self)) {
            categoria.and += " or nomReduzido like '%" + val + "%' or nomCompleto like '%" + val + "%' ";
        }

        categoria.and += (typeof val === 'undefined') ? '' : ') ';

    }

    var setPage = function(pg) {
        pg = (pg <= 0) ? 0 : pg;
        categoria.page = pg;
    }

    var setSort = function(colName) {
        if (!('asc' in categoria)) {
            categoria.asc = true;
        } else {
            categoria.asc = !categoria.asc;
        }

        var direction = categoria.asc ? ' ASC' : ' DESC';
        categoria.sort = 'order by ' + colName + direction;
    }

    var ajaxCall = function() {

        var query = categoria.where.replace('_COL_', categoria.sort) + categoria.and + categoria.sort;

        return fromServer.pullPageEnciclopedia(query, categoria.page, categoria.counter + categoria.and);
    }

    return {
        set: setCat,
        get: getCat,
        sSearch: setSearch,
        sPage: setPage,
        sSort: setSort,
        chamada: ajaxCall
    };

}])

.service('resumoEspecie', ['$http', 'fromServer', function($http, fromServer) {

    var idEspecie;
    var idEstado;
    
    function setId(id, idEst = 1) {
        idEspecie = id;
        idEstado = idEst;
    }

    function getRelatorio() {
        return fromServer.getRelatorio(idEspecie, idEstado);
    }

    return {
        set: setId,
        get: getRelatorio        
    }
}])

.service('ajudaTopico', ['fromServer', function(fromServer) {

    var data;

    function setInfo(info) {
        data = info;
    }

    function getInfo() {
        return data;
    }

    return {
        set: setInfo,
        get: getInfo
    }

}])

.service('linkHelp', ['fromServer', 'tabelaEnciclopedia', 'ajudaTopico', 'resumoEspecie', '$state', function(fromServer, tabelaEnciclopedia, ajudaTopico, resumoEspecie, $state) {

    var tela;

    function setTela(nome) {
        if (tela == nome) return;
        tela = nome;
        tabelaEnciclopedia.set('helpApp');
        tabelaEnciclopedia.sSearch(nome);
    };

    function setInfo(lista, id) {
        var topico = lista.data.filter(x => x.idItemHelp == id);
        
        if(topico.length === 0){
            return;
        }else{
            topico = topico[0];
        }

        ajudaTopico.set(topico);
        $state.go('enciclopediaTopico');
    }

    function setEspecie(id, idEst = 1) {
        //console.log(id);
        resumoEspecie.set(id, idEst);
        $state.go('enciclopediaEspecie');
    }

    return {
        set: setTela,
        info: setInfo,
        call: tabelaEnciclopedia.chamada,
        setEsp: setEspecie
    }

}])

.service('backButtonSet', ['$rootScope', '$ionicPopup', '$ionicPlatform', function($rootScope, $ionicPopup, $ionicPlatform) {
    
    var oldSoftBack = $rootScope.$ionicGoBack;    

    var hardBack;
    
    function setBack(){
        hardBack = $ionicPlatform.registerBackButtonAction(
            alteraBackButton, 101
        );

        $rootScope.$ionicGoBack = alteraBackButton;
    }

    function restoreBack(){
        $rootScope.$ionicGoBack = oldSoftBack;
        hardBack();    
    }

    function alteraBackButton(){
        var alertPopup = $ionicPopup.show({
            //scope: $scope,
            title: 'Deseja voltar?',
            template: 'Retrocedendo à tela anterior as informações preenchidas serão apagadas.',
            buttons: [{
                text: 'Voltar',
                type: 'button-stable',
                onTap: function(e) {
                    $rootScope.$ionicGoBack = oldSoftBack;
                    hardBack();
                    oldSoftBack();                    
                }
            },
            {
                text: 'Cancelar',
                type: 'button-assertive',
                onTap: function(e) {
                    return;
                }
            }]
    
        })
    };

    return {
        set: setBack,
        restore: restoreBack
    }
}])

.service('showDica', ['$ionicPopup', 'storeValues', 'fromServer', '$q', '$ionicActionSheet', '$timeout', '$rootScope', function($ionicPopup, storeValues, fromServer, $q, $ionicActionSheet, $timeout, $rootScope){
    
    var appModulos = ['FLO', 'SAF', 'ENC', 'MPR'];

    var getDicas = function (index) {
        
        if(index === 0){
            storeValues.set('dicas', true);                
        }else{
            storeValues.set('dicas' + appModulos[index], true);
        }
        
        var dicasQuery = "select * from rl.RLDICASAPLICATIVO where moduloApp = '" + appModulos[index] + "'";

        fromServer.pullData(dicasQuery).success(function (res) {
            
            if(index === 0){
                globalUserData.dicas = res;
            }else{
                globalUserData[ 'dicas' + appModulos[index] ] = res;
            }

            if('dicas' in $rootScope){
                var mod = appModulos[index];
                if(mod === 'FLO') mod = '';
                if($rootScope.dicas.type === mod) helpPopup($rootScope.dicas.index, $rootScope.dicas.type);
            }
            
        }).error(x => console.log(x));

    }

    var triggerActionSheet = function () {

        // Show the action sheet
        var showActionSheet = $ionicActionSheet.show({
            buttons: [
                { text: 'Floresta' },
                { text: 'SAF' },
                { text: 'Enciclopédia' },
                { text: 'Planejar propriedade' }
            ],

            //destructiveText: 'Delete',
            titleText: 'Reativar dicas',
            cancelText: 'Cancela',

            cancel: function () {
                return;
            },

            buttonClicked: getDicas,

            destructiveButtonClicked: function () {
                return;
            }
        });
    };

    
    function helpPopup(id, suffix='') {
        var alertPopup = $ionicPopup.show({
            title: 'Dicas',
            template: storeValues['dica' + suffix](id),
            buttons: [
                {
                    text: 'OK',
                    type: 'button-positive',
                    onTap: function () {
                        storeValues.set('dicas' + suffix, true);
                        return;
                    }
                },
                {
                    text: 'Desativar\ndicas',
                    type: 'button-stable',
                    onTap: function () {
                        storeValues.set('dicas' + suffix, false);
                    }
                }]
        });
    };    
    
    function checkDicas(id, type=''){
        if(storeValues.get('dicas' + type) == 'true'){

            if( ('dicas' + type) in globalUserData ){
                helpPopup(id, type);
            }else{
                var indexer;
                switch(type){
                    case '':
                        indexer = 0;
                        break;
                    case 'SAF':
                        indexer = 1;
                        break;
                    case 'ENC':
                        indexer = 2;
                        break;
                    case 'MPR':
                        indexer = 3;
                        break;
                }

                getDicas(indexer);
            }

        }
    }

    return {
        show: triggerActionSheet,
        check: checkDicas
    }

}])