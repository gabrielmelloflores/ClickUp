<?php

require_once 'clickUp.class.php';
$clickup = new Clickup;
$com = $_REQUEST['com'];

if($com == 'getDados') {

	$dados = $clickup->getDados();

	echo json_encode($dados);
}else if($com == 'getDadosPorCliente') {
	
	$dados = $clickup->getDadosPorCliente($_REQUEST['cliente']);

	echo json_encode($dados);
}
