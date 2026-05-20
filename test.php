<?php

$file="/var/www/private_data/lab/results/test.txt";

if(file_put_contents($file,"HELLO")){
    echo "SUCCESS";
}else{
    echo "FAILED";
}
?>
