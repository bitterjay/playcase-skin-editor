<?php
require_once __DIR__ . '/helpers.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('POST only', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    errorResponse('Malformed JSON');
}

$required = ['name','identifier','gameTypeIdentifier','representation','variant'];
foreach ($required as $k) if (empty($input[$k])) errorResponse("Missing $k");

$skinId = sanitizeSkinName($input['identifier']);
$dir = EXTRACTED_DIR . $skinId;
if (file_exists($dir)) errorResponse('Skin already exists', 409);
mkdir($dir, 0777, true);

$orientation = 'portrait';

// Determine representations and variants
$variantsMap = [];
if(isset($input['variants']) && is_array($input['variants'])){
   foreach($input['variants'] as $rep=>$arr){
       foreach($arr as $v){
           $variantsMap[$rep][]=$v;
       }
   }
} else {
   $variantsMap[$input['representation']] = [$input['variant']];
}

$repObjects=[];
foreach($variantsMap as $rep=>$vArr){
    foreach($vArr as $v){
        $repObjects[$rep][$v][$orientation] = [
            'assets'=>['resizable'=>''],
            'items'=>[],
            'screens'=>[],
            'mappingSize'=>['width'=>320,'height'=>240],
            'extendedEdges'=>['top'=>0,'bottom'=>0,'left'=>0,'right'=>0]
        ];
    }
}

$info = [
    'name' => $input['name'],
    'identifier' => $input['identifier'],
    'gameTypeIdentifier' => $input['gameTypeIdentifier'],
    'debug' => !empty($input['debug']),
    'representations' => $repObjects
];
file_put_contents($dir.'/info.json', json_encode($info, JSON_PRETTY_PRINT));
jsonResponse(['id'=>$skinId]);
?> 