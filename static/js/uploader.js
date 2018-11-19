	
	
	/*
		uploader.js - Ver2.0a
		 jsp2 (jlab-script-plus Ver2.0)
	*/
	
	
	//--- ---//
	
	
	//ファイルをドラッグ中
	function onFileOver(e){
		e.preventDefault();
		if( UploaderStatus.Processing ){
			return;
		}
	}
	
	//ファイルをドロップ
	function onFileDrop(e){
	
		//ブラウザの初期動作を抑制
		e.stopPropagation();
		e.preventDefault();
		
		//アップロード処理中は無効化
		if( UploaderStatus.Processing ){
			return;
		}
		
		RawBinaryImages.Counts = e.dataTransfer.files.length;
		RawBinaryImages.Analyzing = 0;
		
		//Windows向け(画像の並べ替え)
		for( var di=0; di < RawBinaryImages.Counts; di++ ){
			RawBinaryImages.Files[di] = e.dataTransfer.files[di];
		}
		RawBinaryImages.Files.sort(function(a, b){
			if( a["name"] > b["name"] ) return 1;
			if( a["name"] < b["name"] ) return -1;
			return 0;
		});
		
		UploaderStatus.DragDrop = true;
		FileLoad();
		
		return;
	}
	
	
	//ダイアログから画像を選択
	function OpenFileDialog(){
		document.getElementById("SelectFiles").click();
		return;
	}
	
	//ダイアログで選択された画像の処理
	function onFileDialog(){
	
		//キャンセルされた場合は終了
		if( !document.getElementById("SelectFiles").files ){
			return;
		}
		
		RawBinaryImages.Files = document.getElementById("SelectFiles").files;
		RawBinaryImages.Counts = document.getElementById("SelectFiles").files.length;
		RawBinaryImages.Analyzing = 0;
		
		UploaderStatus.DragDrop = false;
		FileLoad();
		
		return;
	}
	
	//--- ---//
	
	//取り込まれた画像の処理
	function FileLoad(Optns){
		
		if( Optns ){
			RawBinaryImages.Analyzing = RawBinaryImages.Analyzing + 1;
		}
		
		var AzBinaryImage = RawBinaryImages.Files[RawBinaryImages.Analyzing];
		if( !AzBinaryImage ){
			if( BinaryImages.Counts > 0 ){
				document.getElementById("UploaderControlPanel").style.display = "block";
				document.getElementById("UploaderMessageArea").innerHTML = "<strong>一部エラーが発生しました</strong><br><span style=\"font-size:12px\">サムネイルが表示されている画像のみアップロード準備完了</span>";
				document.getElementById("UploaderStartPanel").style.display = "block";
			}else{
				ClearUploader();
			}
			return;
		}
		
		document.getElementById("UploaderControlPanel").style.display = "none";
		document.getElementById("UploaderMessageArea").innerHTML = "" + (RawBinaryImages.Analyzing+1) + "枚目を取り込み中";
		
		if( BinaryImages.Counts >= MasterSettings.LimitCount ){
			alert("同時アップロード枚数の制限を超えています");
			document.getElementById("UploaderControlPanel").style.display = "block";
			document.getElementById("UploaderMessageArea").innerHTML = "<strong>同時アップロード制限エラー</strong><br><span style=\"font-size:12px\">サムネイルが表示されている画像のみアップロード準備完了</span>";
			document.getElementById("UploaderStartPanel").style.display = "block";
			return;
		}
		
		if( AzBinaryImage.size > MasterSettings.LimitSizeByte ){
			alert(AzBinaryImage.name + " : "+ MasterSettings.LimitSize + "MB以上のファイルはアップロードできません");
			FileLoad(true);
			return;
		}
		
		if( !AzBinaryImage.type.match(/image\/jpeg/) && !AzBinaryImage.type.match(/image\/png/) && !AzBinaryImage.type.match(/image\/gif/)){
			alert(AzBinaryImage.name + "はアップロードできる形式ではありません");
			FileLoad(true);
			return;
		}else{
			BinaryImages.MIMEType[BinaryImages.Counts] = AzBinaryImage.type;
		}
		
		if( BinaryImages.Counts >= 1 ){
			for( var SizeCheck=0; SizeCheck < BinaryImages.Counts; SizeCheck++ ){
				if( BinaryImages.Base64[SizeCheck] == undefined ){
					continue;
				}
				if( AzBinaryImage.size == BinaryImages.Files[SizeCheck].size ){
					alert("同時に同じ画像はアップロードできません");
					FileLoad(true);
					return;
				}
			}
		}
		
		var PhotoReader = new FileReader();
		
		var PreviewImgTag = document.createElement("img");
		var CancelLink = document.createElement("a");
		CancelLink.href = "javascript:ImageCancel(" + BinaryImages.BoxID + ")";
		CancelLink.title = "この画像を取り消しますか？ 取り消す場合には画像をクリックします。";
		CancelLink.id = "PreviewImg" + BinaryImages.BoxID;
		
		//Base64を取得する
		PhotoReader.onload = function(){
			
			var TmpImgBinary = PhotoReader.result.split(",");
			BinaryImages.Files[BinaryImages.BoxID] = AzBinaryImage;
			BinaryImages.Base64[BinaryImages.BoxID] = TmpImgBinary[1];
			
			var TempBlobURL = URL.createObjectURL(new Blob([AzBinaryImage], { type: AzBinaryImage.type }));
			
			document.getElementById("PreviewAreaBox").style.display = "block";
			document.getElementById("PreviewArea").style.display = "block";
			document.getElementById("PreviewAreaMessage").style.display = "none";
			
			PreviewImgTag.src = TempBlobURL;
			CancelLink.appendChild(PreviewImgTag);
			document.getElementById("PreviewArea").appendChild(CancelLink);
			
			BinaryImages.PreviewIDs[BinaryImages.Counts] = "PreviewImg" + BinaryImages.BoxID;
			
			BinaryImages.Counts = BinaryImages.Counts + 1;
			BinaryImages.BoxID = BinaryImages.BoxID + 1;
			RawBinaryImages.Analyzing = RawBinaryImages.Analyzing + 1;
			
			if( RawBinaryImages.Analyzing < RawBinaryImages.Counts ){
				FileLoad();
			}else{
				document.getElementById("UploaderMessageArea").innerHTML = "<strong>アップロード準備完了</strong><br><span style=\"font-size:12px\">プレビュー画像をクリックすると取り消しができます<br>画像を追加するには<strong>ドラッグアンドドロップ</strong>するか<strong>選択</strong>してください</span>";
				if(( UserSettings.FastUpload == "Enable" )&&( MasterSettings.FastUpload )){
					UploaderStatus.Ready = true;
					StartUpload();
					return;
				}
				document.getElementById("UploaderControlPanel").style.display = "block";
				document.getElementById("UploaderStartPanel").style.display = "block";
			}
			
			UploaderStatus.Ready = true;
			PageScroll("ContentsTop");
			document.title = "アップロード準備完了 - " + MasterSettings.Title;
			
		};
		
		PhotoReader.readAsDataURL(AzBinaryImage);
	
	}
	
	//--- ---//
	
	//アップロードを開始する
	function StartUpload(){
	
		if( !UploaderStatus.Ready ){
			alert("アップロードする画像を選択してください");
			return;
		}
		
		document.getElementById("UploaderMessageArea").innerHTML = "待機中…";
		UploaderStatus.Processing = true;
		
		DeleteKey = document.getElementById("DeleteKey").value;
		if(( UserSettings.FastUpload == "Enable" )&&( !DeleteKey )){
			alert("FastUploadを有効にするには削除キーを設定してください");
			document.getElementById("UploaderMessageArea").innerHTML = "<strong>FastUploadエラー</strong><br><span style=\"font-size:12px\">アップロードボタンを押してアップロードを開始してください</span>";
			UploaderStatus.Processing = false;
			return;
		}
		
		document.getElementById("PreviewAreaCover").style.display = "block";
		document.getElementById("UploaderControlPanel").style.display = "none";
		document.getElementById("UploaderStartPanel").style.display = "none";
		document.getElementById("UploaderSelectPanel").style.display = "none";
		
		var UploadedCount = 0;
		var UploadingCount = 0;
		
		//アップロード用関数
		GoUpload = function(){
		
			//タイトルを変更
			document.title = (UploadedCount+1) + "/" + BinaryImages.Counts + " アップロード中 - " + MasterSettings.Title;
			document.getElementById("UploaderMessageArea").innerHTML = (UploadedCount+1) + "枚目をアップロード中…";
			
			//キャンセルされた画像はスキップする
			if( BinaryImages.Base64[UploadingCount] == "Canceled" ){
				UploadingCount++;
				GoUpload();
				return;
			}
			
			//Ajax送信
			xmlRequest.open("POST","./application/uploader.php",true);
			xmlRequest.onreadystatechange = ResultFlush;
			xmlRequest.setRequestHeader("content-type","application/x-www-form-urlencoded;charset=UTF-8");
			xmlRequest.send("Image=" + BinaryImages.Base64[UploadingCount] + "&MIMEType=" + encodeURIComponent(BinaryImages.MIMEType[UploadingCount]) + "&DeleteKey=" + DeleteKey + "");
	
		}
		
		GoUpload();
		
		//アップロードが完了した順にAjaxでフラッシュしていく
		function ResultFlush(){
		
			if( xmlRequest.readyState == 4 ){
				
				//レスポンスを受け取る
				var UploadResponse = decodeURIComponent(xmlRequest.responseText);
				
				//アップロードエラー時の処理
				if( UploadResponse == "400" || UploadResponse == "403" || !UploadResponse ){
				
					document.getElementById("UploaderMessageArea").innerHTML = "エラーが発生した為、アップロードを停止しました";
					document.title = "アップロード失敗 - " + MasterSettings.Title;
					xmlRequest.abort();
					
					switch( UploadResponse ){
						case "400":
							alert("正しくないパラメーターが送信されました");
						break;
						case "403":
							alert("この画像はアップロードできません");
						break;
						default:
							alert("不明なエラーが発生しました\nページを更新して再度お試しください");
						break;
					}
					
					return;
				}
				
				//アップロードカウントを増やす
				UploadingCount = UploadingCount+1;
				UploadedCount = UploadedCount+1;
				
				//1枚目のアップロード終了時
				if( UploadedCount == 1 ){
					document.getElementById("UploadedURLBox").style.display = "block";
					document.getElementById("UploaderFinishPanel").style.display = "block";
					document.getElementById("UploaderControlPanel").style.display = "block";
					document.getElementById("UploadedURLBox").value = MasterSettings.ImageURL + UploadResponse;
					document.getElementById(BinaryImages.PreviewIDs[UploadingCount-1]).innerHTML = "";
				}
				
				//2枚目以降のアップロード終了時
				else if( UploadedCount <= BinaryImages.Counts ){
					var EndedUploadResponse = document.getElementById("UploadedURLBox").value;
					document.getElementById("UploadedURLBox").value = EndedUploadResponse + "\n" + MasterSettings.ImageURL + UploadResponse;
					document.getElementById(BinaryImages.PreviewIDs[UploadingCount-1]).innerHTML = "";
				}
				
				UploaderStatus.UploadedPath[UploadedCount-1] = UploadResponse;
				
				//アップロードに続きがある場合の処理
				if( UploadedCount < BinaryImages.Counts ){
					GoUpload();
				}
				
				//アップロード終了時の表示
				else{
					
					document.getElementById("UploaderFinishButton").style.display = "block";
					document.getElementById("PreviewArea").innerHTML = ""
					document.getElementById("PreviewAreaBox").style.display = "none";
					document.getElementById("UploaderMessageArea").innerHTML = "アップロードが完了しました";
					document.title = "アップロード完了 - " + MasterSettings.Title;
					
					//削除キーが変わっている場合は新しい削除キーをオブジェクトに代入する
					if( UserSettings.DeleteKey != DeleteKey ){
						UserSettings.DeleteKey = DeleteKey;
						localStorage.setItem("jsp-settings",JSON.stringify(UserSettings));
					}
					
					//アップロード履歴に保存
					if( UserSettings.History == "Enable" ){
						for( i=0; i < UploaderStatus.UploadedPath.length; i++ ){
							UploadHistory.UploadedImages.unshift(UploaderStatus.UploadedPath[i]);
						}
						UploadHistory.UploadedCount = UploadHistory.UploadedCount + UploaderStatus.UploadedPath.length;
						SaveUserHistory();
					}
					
					xmlRequest.open("GET","./application/auto-deletion.php",true);
					xmlRequest.onreadystatechange = function(){
						if(( xmlRequest.readyState == 4 )&&( xmlRequest.status == 200 )){
							console.log("Uploader Cleared");
							return;
						}
					};
					xmlRequest.send(null);
				}
			}
			return;
		}
	}
	
	//キャンセル
	function ImageCancel(CancelNumber){
	
		if( window.confirm("画像を取り消しますか？")){
		
			//オブジェクトから削除
			BinaryImages.Files[CancelNumber] = "Canceled";
			BinaryImages.Base64[CancelNumber] = "Canceled";
			BinaryImages.MIMEType[CancelNumber] = "Canceled";
			BinaryImages.Counts = BinaryImages.Counts - 1;
			
			//プレビュー表示を削除
			document.getElementById("PreviewImg" + CancelNumber).innerHTML = "";
			
			//最後の1枚も削除した場合は初期化する
			if( BinaryImages.Counts == 0 ){
				ClearUploader();
			}
		}
		
		return;
	}
	
	//表示と変数・オブジェクトを初期化する
	function ClearUploader(ForceConfirm){
	
		//確認ウィンドウを表示するか
		if( ForceConfirm ){
			if( !window.confirm("画像を取り消しますか？")){
				return;
			}
		}
		
		//変数・オブジェクト初期化
		UploaderStatus.DragDrop = false;
		UploaderStatus.Processing = false;
		UploaderStatus.Ready = false;
		UploaderStatus.UploadedPath = [];
		RawBinaryImages = { Files:[], Counts:0, Analyzing:0 };
		BinaryImages = { Files:[], Base64:[], MIMEType:[], Counts:0, BoxID:0, PreviewIDs:[] };
		UploadedCount = 0;
		
		
		//表示初期化
		document.title = MasterSettings.Title;
		
		//アップローダーメッセージを初期化
		document.getElementById("PreviewAreaMessage").style.display = "inline";
		document.getElementById("UploaderMessageArea").innerHTML = "アップロードする画像を<strong>ドラッグアンドドロップ</strong>するか<strong>選択</strong>してください";

		//プレビューを非表示
		document.getElementById("PreviewAreaCover").style.display = "none";
		document.getElementById("PreviewAreaBox").style.display = "none";
		document.getElementById("PreviewArea").innerHTML = "";
		
		//選択ボタンを表示 # アップロードボタンと完了ボタンを非表示
		document.getElementById("UploaderSelectPanel").style.display = "block";
		document.getElementById("UploaderStartPanel").style.display = "none";
		document.getElementById("UploaderFinishButton").style.display = "none";
		
		//アップロードURLBoxを非表示
		document.getElementById("UploadedURLBox").innerHTML = "";
		document.getElementById("UploadedURLBox").style.display = "none";
		
		
		return;
	
	}