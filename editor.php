<?php

	/*
	
	editor.php
	Version2.0 beta1- jsp2 (jlab-script-plus Ver2.0)
	
	*/
	
	//設定の読込
	$OnlyLoadSettings = true;
	require_once("./manage.php");
	
	//HTML生成のインスタンス生成
	$GenHTML = new GenerateHTML();
	
	//ログイン処理
	$MegaEditor = $_COOKIE["editor"];
	$GetMasterKey = $_POST["masterkey"];
	
	if( $MegaEditor == "logined" ){
		$GenHTML->HTMLMode = 3;
	}else{
		if( !$GetMasterKey ){
			$GenHTML->HTMLMode = 1;
		}else if( $GetMasterKey == $MasterKey ){
			$GenHTML->HTMLMode = 3;
			setcookie("editor", "logined", 0);
		}else if( $GetMasterKey != $MasterKey ){
			$GenHTML->HTMLMode = 2;
		}
	}
	
	$UploaderMessageArea = $GenHTML->UploaderMessageArea();
	$Uploader = $GenHTML->UploaderArea();
	
	//HTML生成クラス
	class GenerateHTML {
		
		/*
		 - HTMLMode
		 1:Not login
		 2:Wrong masterkey
		 3:logined
		*/
		public $HTMLMode;
	
		public function UploaderMessageArea(){
			if( $this->HTMLMode == 1 ){
				return "マスターキーを入力してください";
			}else if( $this->HTMLMode == 2 ){
				return "マスターキーが間違っています";
			}else if( $this->HTMLMode == 3 ){
				return "管理者用メガエディターへようこそ";
			}
		}
	
		public function UploaderArea(){
			if(( $this->HTMLMode == 1 )||( $this->HTMLMode == 2 )){
				return <<< EOD
				<div style="padding:2em 3em; text-align:center">
					<form method="post" action="./editor.php">
						<div><input type="password" name="masterkey" class="DefaultTB" style="width:295px; text-align:center"></div>
						<div style="padding-top:0.5em">
							<input type="submit" class="PositiveBT" value="OK">
							<input type="button" class="DefaultBT" value="キャンセル" onclick="location.href='./'">
						</div>
					</form>
				</div>
EOD;
			}
			
			if( $this->HTMLMode == 3 ){
				return <<< EOD
				<div style="padding:2em 3em; text-align:left">
					<ul id="MegaEditor-MainMenu">
						<li><a href="#">ログファイルをリストアする</a></li>
						<li>ログファイルが破損・消失した場合にリストアして稼働を再開させることができます。</li>
						<li><a href="#">期限切れの画像を一括削除する</a></li>
						<li>設定した保存期間を超えた期限切れの画像を強制的に削除します。</li>
						<li><a href="#">ImageList.json を表示する</a></li>
						<li>画像一覧の ImageList.json を表示します。</li>
						<li><a href="#">メガエディターからログアウトする</a></li>
						<li>メガエディターでの管理が終了したら、必ずログアウトしてください。</li>
					</ul>
				</div>
EOD;
			}
		}
	
	}

?>
<!DOCTYPE html>
<html lang="ja">
<head>

	<meta charset="UTF-8">
	<meta name="robot" content="noindex">
	<title>メガエディター : <?php echo $UploaderTitle; ?></title>
	
	<!-- StyleSheet -->
	<link rel="stylesheet" type="text/css" href="./static/css/style.css">
	<style type="text/css">
	
	#MegaEditor-MainMenu {
		margin:0;
		padding:0;
		list-style:none;
	}
	
	#MegaEditor-MainMenu a {
		text-decoration:none;
	}
	
	#MegaEditor-MainMenu li {
		list-style:none;
	}
	
	#MegaEditor-MainMenu li:nth-child(even){
		color:#777;
		font-size:12px;
		padding-bottom:0.8em;
	}
	
	#MegaEditor-MainMenu li:last-child{
		padding-bottom:0 !important;
	}
	
	</style>
	
	<!-- Javascript -->
	<script type="text/javascript">
	</script>

</head>
<body>

	<!-- Header -->
	<header>
		<h1>メガエディター : <?php echo $UploaderTitle; ?></h1>
	</header>
	
	<div id="UploaderMessageArea"><?php echo $UploaderMessageArea; ?></div>
	<div id="Uploader"><?php echo $Uploader; ?></div>

	<!-- Footer -->
	<footer>
		<div id="FooterInner">
		jlab-script-plus Version 2.0 beta1
		</div>
	</footer>

</body>
</html>