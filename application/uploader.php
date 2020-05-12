<?php
	
	
	/*
		uploader.php
		Version2.0 beta1 - jsp2 (jlab-script-plus Ver2.0)
	*/
	
	
	//PHPの設定
	set_time_limit(0);
	ini_set("display_errors",0);
	header("Content-Type:text/plain; charset=UTF-8");
	
	//manage.phpとモジュールPHPファイルの読み込み
	$OnlyLoadSettings = true;
	require_once(__DIR__ . "/../manage.php");
	require_once(__DIR__ . "/share/class.image.php");
	
	//アップローダーをロックする
	//ロックができなかった場合、ロックができるまで待つ
	$LockFilePath = "./share/ImageList.lock";
	$LockFileOpen = fopen( $LockFilePath,"a" );
	flock( $LockFileOpen,LOCK_EX );
	
	//送信されたデータを取得する
	$Image = $_FILES["Image"]["tmp_name"];
	$MIMEType = $_POST["MIMEType"];
	$DeleteKey = $_POST["DeleteKey"];
	
	//送信されたデータが正しくない場合はエラーを返す
	if(( $Image == "" )||( $MIMEType == "" )){
		echo "400";
		fclose($LockFileOpen);
		exit;
	}
	
	//削除キーがない場合はNoneを設定
	if( $DeleteKey == "" ){
		$DeleteKey = "None";
	}
	
	//MIMETypeのチェック
	switch( $MIMEType ){
		
		//JPEG形式
		case "image/jpeg":
			$ExtensionID = ".jpg";
		break;
		
		//GIF形式
		case "image/gif":
			$ExtensionID = ".gif";
		break;
		
		//PNG形式
		case "image/png":
			$ExtensionID = ".png";
		break;
		
		//非対応拡張子
		default:
			echo "403";
			fclose($LockFileOpen);
			exit;
		break;
		
	}
	
	//画像のサイズを確認する
	//上限を超えている場合はForbiddenを返す
	if( filesize($Image) > ($LimitSize*1024*1024) ){
		echo "403";
		fclose($LockFileOpen);
		exit;
	}

	//現在の時間を取得する（これがファイル名）
	if( $MicroSec ){
		$getMicroTime = explode(".",microtime(true));
		$FileName = $FileBaseName.date("ymdHis").$getMicroTime[1];
	}else{
		$FileName = $FileBaseName.date("ymdHis");
	}
	$UploadTime = date("y/m/d H:i:s");
	
	//同じファイル名がないか確認する（存在した場合は再度時間を取得し付け直す）
	if( file_exists("../{$LogFolder}/{$FileName}.json") ){
		sleep(1);
		$FileName = $FileBaseName.date("ymdHis");
		$UploadTime = date("y/m/d H:i:s");
	}
	$ImagePath = "../{$SaveFolder}/".$FileName.$ExtensionID;
	move_uploaded_file($Image, $ImagePath);
	
	//画像サイズとファイルサイズを取得
	list($ImageWidth,$ImageHeight,$MType,$Attr) = getimagesize($ImagePath);
	$FileSizes = round( filesize($ImagePath)/1024 );
	
	//サムネイル画像の作成
	$CreateThumb = new Image($ImagePath);
	$CreateThumb -> name("../{$ThumbSaveFolder}/".$FileName);
	$CreateThumb -> width($MaxThumbWidth);
	$CreateThumb -> save();
	$ImageThumbPath = "../{$ThumbSaveFolder}/".$FileName.$ExtensionID;
	
	//イメージ情報をJSON形式で保存（新形式）
	$ImageDataPath_json = "../{$LogFolder}/{$FileName}.json";
	$ImageDataArray = array(
		"Name" => $FileName.$ExtensionID,
		"Time" => $UploadTime,
		"Size" => $FileSizes,
		"Width" => $ImageWidth,
		"Height" => $ImageHeight,
		"DeleteKey" => $DeleteKey,
		"IP" => $_SERVER["REMOTE_ADDR"],
		"RemoteHost" => gethostbyaddr($_SERVER["REMOTE_ADDR"]),
		"UserAgent" => $_SERVER["HTTP_USER_AGENT"]
	);
	file_put_contents($ImageDataPath_json, json_encode($ImageDataArray,JSON_PRETTY_PRINT));
	chmod($ImageDataPath_json, 0600); 
	
	//Streamに追加する
	$ImageListPath = "../{$LogFolder}/ImageList.json";
	$ImageList = json_decode(file_get_contents($ImageListPath), true);
	$newImageList[] = array(
		"Name" => $FileName.$ExtensionID,
		"Time" => $UploadTime,
		"Width" => $ImageWidth,
		"Height" => $ImageHeight,
		"Size" => $FileSizes,
		"IP" => $_SERVER["REMOTE_ADDR"]
	);
	if( empty( $ImageList ) ){
		$ImageList = $newImageList;
		file_put_contents($ImageListPath, json_encode($ImageList));
		chmod($ImageListPath, 0600);
	}else{
		$ImageList = array_merge($newImageList, $ImageList);
		file_put_contents($ImageListPath, json_encode($ImageList));
	}
	
	//終了
	echo urlencode("{$FileName}{$ExtensionID}");

	//アップローダーロックを解除する
	fclose($LockFileOpen);

	exit;

?>