<?php
	
	
	/*
		auto-deletion.php
		jlab-script-plus 2.0 beta2
	*/
	
	
	set_time_limit(0);
	ini_set("display_errors",0);
	header("Content-Type:text/plain; charset=UTF-8");
	
	$OnlyLoadSettings = true;
	require_once(__DIR__ . "/../manage.php");
	require_once("./share/class.functions.php");
	
	//インスタンスの作成
	$AutoDeletion = new EditImages();
	$AutoDeletion->SaveDay = $SaveDay;
	
	//指定日時の画像が既に削除済みかを確認
	$AutoDeletionTrigger = $AutoDeletion->CheckAutoDeleteTrigger();
	if( $AutoDeletionTrigger === 2 ){
		echo "［ｉ］既に実行済みです\n";
		echo "［ｉ］自動削除処理が終了しました";
		exit;
	}
	$AutoDeletion->AutoDeletionTrigger = $AutoDeletionTrigger;
	
	//スキャンして自動削除を開始する
	$DeletionDate = $AutoDeletion->ScanAutoDelete();
	
	if( $DeletionDate ){
		echo "［ｉ］自動削除ログファイルを更新しました\n";
		echo "［ｉ］自動削除処理が終了しました";
	}else{
		echo "［！］自動削除処理に失敗しました\n";
	}
	
	exit;
	
?>