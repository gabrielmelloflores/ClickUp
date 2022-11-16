<?php
class ClickUp {

    public $auth = "pk_54943811_RW5PF2RYQTH2F6A1OA23XGZB5DHDDVCW";
    public $allStatus = array();

    public function inicio() {
        $resp = $this->comunica();
        $dados = $this->ordenaDados($resp);
        $this->allStatus = $this->getStatus($resp);

    }

    public function getDados(){;

        $api = [
            'url' => 'list/386867749/task',
            'method' => 'GET',
        ];

        $resp = $this->comunica($api);
        $dados = $this->ordenaDados($resp);
        
        return $dados;

    }

    public function getDadosPorCliente($cliente) {
        $query = array(
            "custom_fields" => '[{"field_id":"8c5a736a-5f88-4cb1-9665-4e28168092cc","operator":"=","value":"ANY","Cliente":"=","value":"'.$cliente.'"}]'
          );

        $api = [
            'url' => "/list/386867749/task?" . http_build_query($query),
            'method' => 'GET'
        ];

        $resp = $this->comunica($api);
        $dados = $this->ordenaDados($resp);
        return $dados;

    }


    public function ordenaDados($dados){
        $arr = array();
        foreach ($dados['tasks'] as $dado) {
            if (array_key_exists($dado['status']['status'],$arr)){
                $arr[$dado['status']['status']][] = $dado;
            }else{
                $arr[$dado['status']['status']][] = $dado;
            }
        }
        return $arr;
    }

    public function getStatus($dados){
        $arr= array();
        foreach ($dados['tasks'] as $dado) {
            //Caso já tenha sido adicionado o status no array, ele apenas incrementa.
            //Caso não, ele cria uma chave no array com o nome do status.
            if (array_key_exists($dado['status']['status'],$arr)){
                $arr[$dado['status']['status']] += 1;
            }else{
                $arr[$dado['status']['status']] = 1;
            }
        }
        return $arr;
    }

    public function comunica($dados) {
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://api.clickup.com/api/v2/'.$dados['url'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $dados['method'],
            CURLOPT_HTTPHEADER => array(
                'Authorization: '.$this->auth,
                'Content-Type: application/json'
            ),
        ));

        $response = curl_exec($curl);
        $response = json_decode($response, 1);

        curl_close($curl);
        return $response;
    }
} 


$clickup = new Clickup;