var ClickUp = {
	
    dadosApi: {},
    ObjTabela : {
        0: "STR", 
        1: "KANBAN",
        2: "Cliente",
        3: "Resumo",
        4: "Dt Abertura",
        5: "Operador",
        6: "Situacao"
    },

    iniciar: function() {
        ClickUp.setCaminhos();
        ClickUp.getDados();

        $('#relatStatus').click(function(){
            ClickUp.geraRelatorioStatus();
        });

        $('#relatClientes').click(function(){
            ClickUp.geraRelatorioClientes();
        });
	},

    setCaminhos: function() {
		ClickUp.caminhoAjax    = '/clickUp/ajax.php';
	},

    getDados: function() {

		var params = {
			com: 'getDados'
		};

        $.ajax({
            url : ClickUp.caminhoAjax,
            type : 'get',
            data : params,
            beforeSend : function(){
                $(".loader").delay(1500).fadeOut("slow");
           }
       })
       .done(function(root){
            $("#resultado").toggle("fast");
            ClickUp.dadosApi = JSON.parse(root);
       })
       .fail(function(jqXHR, textStatus, msg){
            alert(msg);
       });

		return true;
	},

    // ------------- INICIO RELATÓRIO POR STATUS -------------
    geraRelatorioStatus: function() {
        ClickUp.geraCabecalhoStatus();
        $('.status').click(function(){
            var keys = Object.keys(ClickUp.dadosApi);
            for(k in keys){
                if(keys[k] == $(this).attr('status')){
                    var key = k;
                }
            }
            if($(this).hasClass('ativo')){
                $('#resultado #'+key).remove();
                $(this).removeClass('ativo')
            }else{
                ClickUp.geraCorpoStatus(ClickUp.dadosApi[$(this).attr('status')], key);
                $(this).addClass('ativo');
            }  
        })
    },

    geraCabecalhoStatus: function() {
        var html = '<table id="tableAllStatus" class="table table-dark">'
                 +   '<tr>';
                 $.each(ClickUp.dadosApi, function(dados) {
                    html += '<th class="status" status="'+dados+'"><span>' + dados + '</span> - ' + ClickUp.dadosApi[dados].length + '</th>';
                  });
            html +=   '</tr>'
                 + '</table>';
        
        $('#resultado').html(html);
    },

    geraCorpoStatus: function(item, statusKey){
        var arrayDados = $.map(item, function(value){
            return [value];
        });
        
        var html = '<table id="'+statusKey+'" class="table table-striped">'
                +    '<tr>'
                +    '   <th colspan="8" style="text-align: center; background-color: #ddd;">' + item[0]['status']['status'] + ' - ' + item.length + '</th>'
                +   '</tr>'
                +  ' <tr>'
                +       '<th></th>'
                +       '<th>STR</th>'
                +       '<th>KANBAN</th>'
                +       '<th>Cliente</th>'
                +       '<th>Resumo</th>'
                +       '<th>Dt Abertura</th>'
                +       '<th>Operador</th>'
                +       '<th>Situacao</th>'
                +   '</tr>';
                var i = 0;
                arrayDados.forEach(function(dados) {
                    html += '<tr>'
                         +   '<td></td>';
                    while(i<Object.keys(ClickUp.ObjTabela).length){
                        dados['custom_fields'].forEach(function(custom) {   
                            var found = ClickUp.montaLinhaTabela(custom, ClickUp.ObjTabela[i]);
                            if(found){
                                if ('value' in custom){
                                    if(ClickUp.ObjTabela[i] == "Dt Abertura"){
                                        html += '<td>' + ClickUp.conversorTimestampToDate(parseInt(custom['value'])) +'</td>';
                                    }else if(ClickUp.ObjTabela[i] == "Situacao") {
                                        html += '<td>' + ClickUp.nomeSituacao(custom['type_config']['options'], custom['value']) +'</td>';
                                    }else if(ClickUp.ObjTabela[i] == "Operador"){
                                        html += '<td>' + ClickUp.nomeOperador(custom['type_config']['options'], custom['value']) +'</td>';
                                    }else{
                                        html += '<td>' + custom['value'] +'</td>';
                                    }
                                }else{
                                    html += '<td> - </td>';
                                }
                                i++;
                            }
                        });
                    }
                    html += '</tr>';
                    i = 0;
                });
                html += '</table>';
                $('#resultado').append(html);
    },

    montaLinhaTabela: function(input,target){
            var found;
            for (var prop in input) {
                if(input[prop] == target){
                    found = 1;
                }
            };
            return found;
    },

    

    // ------------- INICIO RELATÓRIO POR CLIENTE -------------
    
    geraRelatorioClientes: function() {
        ClickUp.geraCabecalhoClientes(ClickUp.dadosApi);

        $('#filtrarCliente').click(function(e){
            e.preventDefault();
            ClickUp.getDadosPorCliente($('#selectClientes').val());
            //ClickUp.geraCorpoClientes(ClickUp.dadosApi,$('#selectClientes').val());
        });
        
    },

    geraCabecalhoClientes: function(item) {
        var arrayDados = $.map(item, function(value){
            return [value];
        });
        var optCli =[];
        arrayDados.forEach(function(dados) {
            dados.forEach(function(itens) {
                itens['custom_fields'].forEach(function(custom) {
                    if(custom['name'] == "Cliente"){
                        if ('value' in custom){
                            if (optCli.indexOf(custom['value']) == -1){
                                optCli.push(custom['value']);
                            }
                        }
                    }
                });
            });
        });

        var html = '<form class="centralizar" style="width:100%">'
                 +    '<div class="form-row" style="display: flex">'
                 +      '<div class="col-md-4 mb-3">'
                 +          '<select id="selectClientes" class="form-select" aria-label="Default select example">';
        optCli.forEach(function(valor) {
            html += '<option>'+valor+'</options>';
        });
        html += '</select>'
             +  '</div>'
             +  '<div class="col-md-4 mb-3">'
             +  '<button style="margin-left:10px" class="btn btn-primary" id="filtrarCliente" type="submit">Filtrar</button>'
             +  '</div></div></form>'
    
        $('#resultado').html(html);
    },

    getDadosPorCliente: function(cliente){
        var params = {
			'com': 'getDadosPorCliente',
            'cliente': cliente
		};

        $.ajax({
            url : ClickUp.caminhoAjax,
            type : 'get',
            data : params,
            beforeSend : function(){
                $(".loader").fadeIn("slow");
                $(".loader").delay(1500).fadeOut("slow");
           }
       })
       .done(function(root){
            var root = (JSON.parse(root));
            var html = '<table class="table table-striped">'
                +    '<tr>'
                +    '   <th colspan="8" style="text-align: center; background-color: #ddd;">' + cliente + '</th>'
                +   '</tr>'
                +   '</table>';
            $('#resultado').html(html);
            $.each(root, function(dados) {
                ClickUp.geraCorpoClientes(root[dados], cliente);
            });
       })
       .fail(function(jqXHR, textStatus, msg){
            alert(msg);
       });

		return true;
    },

    geraCorpoClientes: function(item, cliente){
        var arrayDados = $.map(item, function(value){
            return [value];
        });
        
        var html = '<table class="table table-striped">'
                +    '<tr>'
                +    '   <th colspan="8" style="text-align: center; background-color: #ddd;">' + item[0]['status']['status'] + ' - ' + item.length + '</th>'
                +   '</tr>'
                +  ' <tr>'
                +       '<th></th>'
                +       '<th>STR</th>'
                +       '<th>KANBAN</th>'
                +       '<th>Cliente</th>'
                +       '<th>Resumo</th>'
                +       '<th>Dt Abertura</th>'
                +       '<th>Operador</th>'
                +       '<th>Situacao</th>'
                +   '</tr>';
                var i = 0;
                arrayDados.forEach(function(dados) {
                    html += '<tr>'
                         +   '<td></td>';
                    while(i<Object.keys(ClickUp.ObjTabela).length){
                        dados['custom_fields'].forEach(function(custom) {   
                            var found = ClickUp.montaLinhaTabela(custom, ClickUp.ObjTabela[i]);
                            if(found){
                                if ('value' in custom){
                                    if(ClickUp.ObjTabela[i] == "Dt Abertura"){
                                        html += '<td>' + ClickUp.conversorTimestampToDate(parseInt(custom['value'])) +'</td>';
                                    }else if(ClickUp.ObjTabela[i] == "Situacao") {
                                        html += '<td>' + ClickUp.nomeSituacao(custom['type_config']['options'], custom['value']) +'</td>';
                                    }else if(ClickUp.ObjTabela[i] == "Operador"){
                                        html += '<td>' + ClickUp.nomeOperador(custom['type_config']['options'], custom['value']) +'</td>';
                                    }else{
                                        html += '<td>' + custom['value'] +'</td>';
                                    }
                                }else{
                                    html += '<td> - </td>';
                                }
                                i++;
                            }
                        });
                    }
                    html += '</tr>';
                    i = 0;
                });
                html += '</table>';
                $('#resultado').append(html);
    },

    // ------------- FUNÇÕES GLOBAIS -------------

    conversorTimestampToDate: function(timestamp) {
        var date = new Date(timestamp);
        return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear();
    },

    nomeSituacao: function(opcoes, valor) {
        var situacao;
        opcoes.forEach(function(item){
            if(item['orderindex'] == valor){
                situacao =  item['name'];
            }
        });
        return situacao;
    },

    nomeOperador: function(opcoes, valor) {
        var situacao;
        opcoes.forEach(function(item){
            if(item['orderindex'] == valor){
                situacao =  item['name'];
            }
        });
        return situacao;
    },

};