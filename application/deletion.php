<?php
	
	
	/*
		deletion.php
		Version2.0 beta1 - jsp2 (jlab-script-plus Ver2.0)
	*/
	
	
	set_time_limit(0);
	ini_set("display_errors",0);
	header("Content-Type:text/plain; charset=UTF-8");
	
	$OnlyLoadSettings = true;
	require_once(__DIR__ . "/../manage.php");
	require_once("./share/class.functions.php");
	
	$LockFilePath = "./share/ImageList.lock";
	$LockFileOpen = fopen( $LockFilePath,"a" );
	flock( $LockFileOpen,LOCK_EX );
	
	$DeleteImageNames = json_decode($_POST["DeleteImages"]);
	$DeleteKey = $_POST["DeleteKey"];
	$ChangedImageList = false;
	$Response = Array();
	
	if(( !$DeleteImageNames )||( $DeleteKey == "" )){
		fclose($LockFileOpen);
		http_response_code(403);
		exit;
	}
	
	$DeletionTask = new EditImages();
	$DeletionTask->DeleteKey = $DeleteKey;
	
	$DeleteImageCount = count($DeleteImageNames);
	for($ExecuteCount=0; $ExecuteCount < $DeleteImageCount; $ExecuteCount++ ){
	
		$DeletionTask->ImageName = $DeleteImageNames[$ExecuteCount];
		$CheckingResponse = $DeletionTask->CheckDeleteKey();
		
		if( $CheckingResponse === 200 ){
			
			$DeletionTask->DeleteImage();
			$ChangedImageList = true;
			$Response[$DeleteImageNames[$ExecuteCount]] = 0;
			
		}else if( $CheckingResponse === 403 ){
			
			$Response[$DeleteImageNames[$ExecuteCount]] = 1;
			continue;
			
		}else if( $CheckingResponse === 404 ){
			
			$Response[$DeleteImageNames[$ExecuteCount]] = 2;
			continue;
			
		}
		
		if( $ExecuteCount == 0 ){
			$DeletionTask->LoadImageList_array();
		}
		
		$DeletionTask->DeleteElement_ImageList();
		
	}
		
	if( $ChangedImageList ){
		$DeletionTask->SaveImageList();
	}
	
	fclose($LockFileOpen);
	echo json_encode($Response);
	exit;
	
?>
		