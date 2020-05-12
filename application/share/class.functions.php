<?php

	/*
		class.functions.php
		jlab-script-plus 2.0 beta2
	*/
	
	//画像編集用クラス
	class EditImages {
	
		//[ $ImageName ]はjpg/gif/pngのデータを指定する
		public $ImageName;
		public $DeleteKey;
		public $SaveDay;
		public $AutoDeletionTrigger;
		
		//プライベート変数初期化
		private $ImageData;
		private $ImageDataPath;
		private $ImageNameNumber;
		private $ExtensionID;
		private $ImageListPath;
		private $ImageList;
		private $FileNameArray;
		private $FileNameArrayKey;
		private $FileNameArrayValue;
		private $ImageNameKey;
		private $ymdToday;
		private $AutoDeletionLog;
		private $AutoDeletionLogPath;
		private $UploadedDay;
		
		public function CheckDeleteKey(){
		
			global $LogFolder;
		
			list( $this->ImageNameNumber, $this->ExtensionID ) = explode(".", $this->ImageName);
			$this->ImageDataPath = "../{$LogFolder}/".$this->ImageNameNumber.".json";
			if( !file_exists( $this->ImageDataPath ) ){
				return 404;
			}else{
				$this->ImageData = json_decode(file_get_contents($this->ImageDataPath), true);
				if( $this->DeleteKey === $this->ImageData["DeleteKey"] ){
					return 200;
				}else{
					return 403;
				}
			}
		}
		
		public function CheckAutoDeleteTrigger(){
		
			global $LogFolder;
			global $FileBaseName;
			global $AutoDeletionConfig;
			
			$this->ymdToday = $FileBaseName.date($AutoDeletionConfig, strtotime("-{$this->SaveDay} days"));
			
			$this->AutoDeletionLogPath = "../{$LogFolder}/AutoDeletion.json";
			if( file_exists( $this->AutoDeletionLogPath ) ){
				$this->AutoDeletionLog = json_decode(file_get_contents($this->AutoDeletionLogPath), true);
				if(!in_array($this->ymdToday, $this->AutoDeletionLog)){
					return 1; //まだ自動削除が実行されていない
				}else{
					return 2; //既に自動削除が実行済み
				}
			}else{
				$this->AutoDeletionLog = [];
				return 3; //まだ実行されていない(ログファイルも見つからない場合)
			}
			
		}
		
		public function ScanAutoDelete(){
			
			global $AutoDeletionConfig;
			
			$this->LoadImageList_array();
			$this->ymdTodayNumber = date($AutoDeletionConfig, strtotime("-{$this->SaveDay} days") );
			$this->ymdTodayCount = mb_strlen($this->ymdTodayNumber);
			
			foreach( $this->FileNameArray as $this->FileNameArrayKey => $this->FileNameArrayValue ){
				$this->UploadedDay = substr(preg_replace("~[^0-9]~", "", $this->FileNameArrayValue), 0, $this->ymdTodayCount);
				if( $this->UploadedDay <= $this->ymdTodayNumber ){
					$this->ImageName = $this->FileNameArrayValue;
					$this->DeleteImage();
					unset($this->ImageList[$this->FileNameArrayKey]);
				}else{
					continue;
				}
			}
			$this->SaveImageList();
			
			if( $this->AutoDeletionTrigger === 3 ){
				$this->AutoDeletionLog[] = $this->ymdToday;
			}else{
				array_unshift($this->AutoDeletionLog, $this->ymdToday);
			}
			file_put_contents($this->AutoDeletionLogPath, json_encode($this->AutoDeletionLog));
			return $this->ymdToday; //実行終了
		}
		
		public function DeleteImage(){
			
			global $SaveFolder;
			global $ThumbSaveFolder;
			global $LogFolder;
			
			unlink("../{$SaveFolder}/{$this->ImageName}");
			unlink("../{$ThumbSaveFolder}/{$this->ImageName}");
			list( $this->ImageNameNumber, $this->ExtensionID ) = explode(".", $this->ImageName);
			unlink("../{$LogFolder}/".$this->ImageNameNumber.".json");
			
		}
		
		public function LoadImageList_array(){
			
			global $LogFolder;
			
			$this->ImageListPath = "../{$LogFolder}/ImageList.json";
			$this->ImageList = json_decode(file_get_contents($this->ImageListPath), true);
			$this->FileNameArray = array_column($this->ImageList, "Name");
		
		}
		
		public function SaveImageList(){
			file_put_contents($this->ImageListPath, json_encode(array_values($this->ImageList)));
		}
		
		public function DeleteElement_ImageList(){
			$this->ImageNameKey = array_search($this->ImageName, $this->FileNameArray);
			unset($this->ImageList[$this->ImageNameKey]);
		}
	}
	
?>