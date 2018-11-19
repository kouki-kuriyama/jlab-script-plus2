<?php

	/*
	
	manage.php
	Version2.0 beta1 - jsp2 (jlab-script-plus Ver2.0)
	
	☆アップローダーの設定ファイルです。
	　アップローダーの動作に必要な設定内容ですので、各環境に合った設定に変更してください。
	　数値はそのまま記入、数値以外の文字列はクォート（'〜'）の中に記入してください。 ←人の顔に見える
	　★（黒星）の項目は、高度な設定でデフォルトが推奨値です。特に理由が無い場合はデフォルトでの運用をオススメします。
	
	/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#
	
	［ｉ］これより下が設定です。
	
	/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#
	
	*/
	
	//☆管理者用マスターキー
	//　削除キーの暗号復元や、管理者による画像の削除に使用します。
	//　必ず8文字以上の半角英数字を設定して下さい。
	$MasterKey = 'MasterKey';
	
	//☆管理者名
	//　index.htmlに管理者名として表示されます
	$Admin = '管理者◆TripKeys10';
	
	//☆画像保存フォルダ(最後の / は不要です)
	$SaveFolder = 's';

	//☆サムネイル保存フォルダ(最後の / は不要です)
	$ThumbSaveFolder = 't';

	//☆ログファイル保存フォルダ(最後の / は不要です)
	$LogFolder = 'd';

	//☆アップローダーのURL(http:// 若しくは https://から)
	//　index.html が表示されるURLを指定してください。
	//　URLはプロトコルから始め、最後に必ず / が入るようにしてください。
	$FullURL = 'https://base.snpht.org/jsp2/';

	//☆ファイル名接頭語(不要な場合は空欄にしてください)
	//　アップローダー稼働後に接頭語を変更すると、表示や自動削除などに不具合が生じる場合があるのでご注意ください。
	$FileBaseName = 'test';

	//☆アップローダーのタイトル
	$UploaderTitle = '実況ろだTEST';

	//☆画像の保存日数(Day(s))
	$SaveDay = 5;

	//☆画像の最大サイズ(MB)
	$LimitSize = 5;
	
	//☆画像の同時アップロード枚数
	//　画像の同時アップロード枚数を指定します。1に設定すると同時アップロード機能を無効にします。
	$LimitCount = 5;
	
	//☆JLABリングを表示する
	//　JLABに参加している場合は設定をtrueにしてください。index.html の右上にJLABろだリングが表示されます。
	//　HTTPSでアップローダーを運営する場合は、UseHTTPSをtrueにしてください。HTTPS対応のJLABろだリングが表示されます。
	//　【重要】JLAB Ringは廃止されました。この設定は後の為に保存してありますが、特に変更が無ければコメントアウトしておくことをオススメします。
	//$JLABRing = true;
	//$UseHTTPS = true;
	
	//☆詳細ファイル名を使用する
	//　1秒に1枚以上の画像を受け付ける場合は true に設定します。
	//　ファイル名と拡張子の間にマイクロ秒が追加されます。（ファイル名が4〜5桁ほど長くなります）
	$MicroSec = true;
	
	//☆FastUploadの許可
	//　画像をドラッグアンドドロップ・選択後に「アップロードボタン」を押さずにアップロードするFastUpload機能を許可します。
	//　許可した場合、FastUploadはそれぞれユーザー自身で設定タブから有効にすることにより初めて機能します。（ユーザー側の初期値は無効）
	//　trueで許可、falseで拒否できます。（高速連続投稿が可能になるため、サーバーによっては負荷が上昇する場合があります）
	$FastUpload = true;
	
	//☆cronによる自動削除の設定（VPS等cronが設定できるサーバ向け）
	//　crontabによる期限切れ画像の自動削除の設定を有効にします。
	//　この設定を true にして、crontabで application/auto-deletion.php を定期的に実行すると、cronで期限切れの画像を自動削除できるようになります。
	//　false にした場合、crontabでの定期削除は無効化され、ユーザーの画像をアップロードがトリガーとなり自動削除がされます。
	//　（1日おきにcron, トリガーを動かす場合は $AutoDeletionConfig を ymd に、1時間おきに動かす場合は ymdH に変更してください）
	$UseCrontab = false;
	$AutoDeletionConfig = "ymdH";

	//★サムネイル画像の最大幅(ピクセル)
	$MaxThumbWidth = 250;
	
	//★サムネイル画像の最大高さ(ピクセル)
	$MaxThumbHeight = 250;
	
	//★画像配信URLの変更
	//　mod_rewrite機能またはURL書き換え機能を使って画像配信URLを変更するときに設定します。特に使用しない場合は空欄にしてください。
	//　mod_rewrite機能の詳しい説明についてはApacheサイト・nginxサイトや書籍等をご覧ください。
	//　http://jikkyo.org/jlab-script-plus/s/123.jpg を http://jikkyo.org/img/123.jpg にリライトして配信するには設定に $RewriteURL = 'http://jikkyo.org/img/'; と設定してください。
	$RewriteURL = '';
	
	/*
	
	○jsp2 の基本設定は以上です。
	　この manage.php とそれ以外のファイルとをフォルダをサーバーにアップロードしてください。
	　アップロード後、ブラウザから manage.php にアクセスしてアップローダーの設定を完了してください。
	　ルートフォルダに index.html と master.js が生成されます。
	
	○同梱の custom-html.php を使って index.html にろだ独自のメニューやテキストを追加することができます。
	　バージョンアップの際にメニューやテキストを引き継ぐときは custom-html.php の上書きしないようにご注意ください。
	
	○manage.php にアクセスして、設定にエラーが無い場合は自動的にアップローダートップページが表示されます。
	　設定にエラーがあった場合は、エラー内容が表示されます。
	
	○後から設定を変更する場合は、生成された master.js を削除して、設定変更後の manage.php にアクセスしてください。
	　index.html と master.js が再生成されます。
	　master.js が存在するときに manage.php にアクセスしても設定値は上書きされません。
	
	/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#
	
	［！］これより下は設定用スクリプトです。
	　　　間違えて変更しないようにご注意ください。
	
	/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#/#
	
	*/
	
	if( !$OnlyLoadSettings ){
		
		header("Content-Type:text/plain; charset=UTF-8");
		$MasterJSPath = "./master.js";
		
		if( !file_exists( $MasterJSPath )){
			
			$StaticDataFolder = "static";
			$TempleteIndexPath = "./{$StaticDataFolder}/templete/templete-index.html";
			$TempleteMasterPath = "./{$StaticDataFolder}/templete/templete-master.js";
			
			if( !is_dir("./{$StaticDataFolder}/") ){
				echo "［！］static フォルダが存在しません。\n";
				exit;
			}
		
			if( !is_dir("./{$SaveFolder}/") ){
				echo "［！］{$SaveFolder} フォルダが存在しません。\n";
				exit;
			}
			
			if( !is_dir("./{$ThumbSaveFolder}/") ){
				echo "［！］{$ThumbSaveFolder} フォルダが存在しません。\n";
				exit;
			}
			
			if( !is_dir("./{$LogFolder}/") ){
				echo "［！］{$LogFolder} フォルダが存在しません。\n";
				exit;
			}
			
			if( !touch("./{$SaveFolder}/image-folder") ){
				echo "［！］{$SaveFolder} フォルダへ書き込みができません。\n";
				echo "　　　{$SaveFolder} フォルダのパーミッションをご確認ください。\n\n";
				exit;
			}
			
			if( !touch("./{$ThumbSaveFolder}/thumbnail-folder") ){
				echo "［！］{$ThumbSaveFolder} フォルダへ書き込みができません。\n";
				echo "　　　{$ThumbSaveFolder} フォルダのパーミッションをご確認ください。\n\n";
				exit;
			}
			
			if( !touch("./{$LogFolder}/log-folder") ){
				echo "［！］{$LogFolder} フォルダへ書き込みができません。\n";
				echo "　　　{$LogFolder} フォルダのパーミッションをご確認ください。\n\n";
				exit;
			}
			
			include_once("./custom-html.php");
			
			/*
			if( $JLABRing ){
				$JLABRingCSS = "block";
			}else{
				$JLABRingCSS = "none";
			}
			
			if( $UseHTTPS ){
				$JLABRingURL = "https://base.snpht.org/jlab-base/ring.html";
			}else{
				$JLABRingURL = "http://livech.sakura.ne.jp/jlab/ring.html";
			}
			*/
			
			$TempleteIndex = file_get_contents($TempleteIndexPath);
			$TempleteIndex = str_replace("<!--##UploaderTitle##-->", $UploaderTitle, $TempleteIndex);
			//$TempleteIndex = str_replace("<!--##JLABRing##-->", $JLABRingCSS, $TempleteIndex);
			//$TempleteIndex = str_replace("<!--##RingURL##-->", $JLABRingURL, $TempleteIndex);
			$TempleteIndex = str_replace("?MasterJSUpdateTime", "?".time(), $TempleteIndex);
			$TempleteIndex = str_replace("<!--##Admin##-->", $Admin, $TempleteIndex);
			$TempleteIndex = str_replace("<!--##LimitSize##-->", $LimitSize, $TempleteIndex);
			$TempleteIndex = str_replace("<!--##LimitCount##-->", $LimitCount, $TempleteIndex);
			$ImageURL = "{$FullURL}{$SaveFolder}/";
			$TempleteIndex = str_replace("<!--##ImageURL##-->", $ImageURL, $TempleteIndex);
			$TempleteIndex = str_replace("<!--##FileBaseName##-->", $FileBaseName, $TempleteIndex);
			$TempleteIndex = str_replace("<!--##SaveDays##-->", $SaveDay, $TempleteIndex);
			$TempleteIndex = str_replace("<!--##CustomHTML1##-->", $CustomHTML1, $TempleteIndex);
			$TempleteIndex = str_replace("<!--##CustomHTML2##-->", "<div id=\"CustomFooter\">".$CustomHTML2."</div>\n", $TempleteIndex);
			if( file_put_contents("./index.html", $TempleteIndex) === false ){
				echo "［！］index.html の保存に失敗しました\n\n";
				exit;
			}
			
			$TempleteMaster = file_get_contents($TempleteMasterPath);
			$TempleteMaster = str_replace("<!--##UploaderTitle##-->", $UploaderTitle, $TempleteMaster);
			$TempleteMaster = str_replace("<!--##LimitSize##-->", $LimitSize, $TempleteMaster);
			$TempleteMaster = str_replace("<!--##LimitCount##-->", $LimitCount, $TempleteMaster);
			$TempleteMaster = str_replace("<!--##ImageURL##-->", $ImageURL, $TempleteMaster);
			$TempleteMaster = str_replace("<!--##FastUpload##-->", var_export($FastUpload, true), $TempleteMaster);
			$TempleteMaster = str_replace("<!--##ThumbDirectory##-->", $ThumbSaveFolder, $TempleteMaster);
			if( file_put_contents("./master.js", $TempleteMaster) === false ){
				echo "［！］master.js の保存に失敗しました\n\n";
				exit;
			}
			header("Location:./");
		}else{
			header("Location:./?ErrorMessage=設定を変更するには[master.js]を削除してください");
		}
		exit;
	}
?>